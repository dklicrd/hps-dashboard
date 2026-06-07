/**
 * Route: /api
 * CRUD principal del dashboard
 * - Meses (datos completos por mes)
 * - Transacciones
 * - Resumen anual y cálculos de rentabilidad
 */
import { Router } from 'express';
import db from '../db/connection.js';
import { verificarToken, soloAdmin } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ============================================================
// MESES
// ============================================================

// GET /api/meses — lista de meses (con resumen)
router.get('/meses', async (req, res) => {
  try {
    const meses = await db('meses')
      .select('*')
      .orderBy('anio', 'desc')
      .orderBy('mes', 'asc');

    // Agregar si tiene datos
    const result = await Promise.all(
      meses.map(async (m) => {
        const txnCount = await db('transacciones')
          .where({ mes_id: m.id })
          .count('id as count')
          .first();
        return {
          ...m,
          transacciones: parseInt(txnCount.count),
        };
      })
    );

    res.json({ meses: result });
  } catch (error) {
    console.error('Error GET /meses:', error);
    res.status(500).json({ error: 'Error al cargar meses' });
  }
});

// GET /api/meses/:anio/:mes — datos completos del mes
router.get('/meses/:anio/:mes', async (req, res) => {
  try {
    const { anio, mes } = req.params;
    const mesRecord = await db('meses')
      .where({ anio: parseInt(anio), mes: parseInt(mes) })
      .first();

    if (!mesRecord) {
      return res.status(404).json({ error: 'Mes no encontrado' });
    }

    const mesId = mesRecord.id;

    // Cargar todos los datos relacionados
    const [transacciones, costos, gastos, kpis, suplidores, metas] =
      await Promise.all([
        db('transacciones').where({ mes_id: mesId }).orderBy('fecha', 'desc'),
        db('costos_mensuales').where({ mes_id: mesId }).first(),
        db('gastos_mensuales').where({ mes_id: mesId }).first(),
        db('kpis_comerciales').where({ mes_id: mesId }).first(),
        db('suplidores_adicionales').where({ mes_id: mesId }),
        db('metas').where({ anio: parseInt(anio) }).first(),
      ]);

    // Cálculos de rentabilidad
    const calculos = calcularRentabilidadMes(
      mesRecord,
      transacciones,
      costos,
      gastos,
      kpis,
      suplidores,
      metas
    );

    res.json({
      mes: mesRecord,
      transacciones,
      costos: costos || null,
      gastos: gastos || null,
      kpis: kpis || null,
      suplidores,
      metas: metas || null,
      calculos,
    });
  } catch (error) {
    console.error('Error GET /meses/:anio/:mes:', error);
    res.status(500).json({ error: 'Error al cargar datos del mes' });
  }
});

// PUT /api/meses/:anio/:mes — upsert datos del mes (solo admin)
router.put('/meses/:anio/:mes', soloAdmin, async (req, res) => {
  try {
    const { anio, mes } = req.params;
    const body = req.body;

    // Upsert de mes/tasa
    const mesId = await upsertMes(anio, mes, body.tasa_cambio);

    // Upsert costos
    if (body.costos) {
      await upsertCostos(mesId, body.costos);
    }

    // Upsert gastos
    if (body.gastos) {
      await upsertGastos(mesId, body.gastos);
    }

    // Upsert kpis
    if (body.kpis) {
      await upsertKPIs(mesId, body.kpis);
    }

    // Suplidores: reemplazar todos
    if (body.suplidores !== undefined) {
      await db('suplidores_adicionales').where({ mes_id: mesId }).del();
      if (body.suplidores.length > 0) {
        await db('suplidores_adicionales').insert(
          body.suplidores.map((s) => ({ mes_id: mesId, nombre: s.nombre, valor_usd: s.valor_usd || 0 }))
        );
      }
    }

    // Transacciones: reemplazar todas (borrar y volver a insertar)
    if (body.transacciones) {
      await db('transacciones').where({ mes_id: mesId }).del();
      if (body.transacciones.length > 0) {
        const txnRecords = body.transacciones.map((t) => ({
          mes_id: mesId,
          fecha: t.fecha,
          cliente: t.cliente,
          presupuesto: t.presupuesto || null,
          linea: t.linea || 'SIN_CLASIFICAR',
          tipo_producto: t.tipo_producto || null,
          estatus: t.estatus || 'PENDIENTE',
          monto_bruto_usd: t.monto_bruto_usd,
          monto_neto_usd: t.monto_neto_usd,
          itbis_usd: t.itbis_usd,
          descripcion: t.descripcion || null,
          exento_itbis: t.exento_itbis || false,
        }));
        await db('transacciones').insert(txnRecords);
      }
    }

    // Actualizar timestamp del mes
    await db('meses').where({ id: mesId }).update({ updated_at: db.fn.now() });

    const updated = await db('meses').where({ id: mesId }).first();
    res.json({ message: 'Datos guardados exitosamente', mes: updated });
  } catch (error) {
    console.error('Error PUT /meses/:anio/:mes:', error);
    res.status(500).json({ error: 'Error al guardar datos del mes' });
  }
});

// ============================================================
// TRANSACCIONES INDIVIDUALES
// ============================================================

// GET /api/transacciones — todas las transacciones (con filtros)
router.get('/transacciones', async (req, res) => {
  try {
    const { anio, mes, linea, estatus, cliente, limit, offset } = req.query;
    let query = db('transacciones')
      .join('meses', 'transacciones.mes_id', 'meses.id')
      .select('transacciones.*', 'meses.anio', 'meses.mes');

    if (anio) query = query.where('meses.anio', parseInt(anio));
    if (mes) query = query.where('meses.mes', parseInt(mes));
    if (linea) query = query.where('transacciones.linea', linea);
    if (estatus) query = query.where('transacciones.estatus', estatus);
    if (cliente) query = query.where('transacciones.cliente', 'ilike', `%${cliente}%`);

    query = query.orderBy('transacciones.fecha', 'desc').orderBy('transacciones.id', 'desc');

    if (limit) query = query.limit(parseInt(limit));
    if (offset) query = query.offset(parseInt(offset));

    const transacciones = await query;
    res.json({ transacciones });
  } catch (error) {
    console.error('Error GET /transacciones:', error);
    res.status(500).json({ error: 'Error al cargar transacciones' });
  }
});

// POST /api/transacciones — crear transacción (solo admin)
router.post('/transacciones', soloAdmin, async (req, res) => {
  try {
    const t = req.body;

    // Encontrar o crear el mes correspondiente
    const fecha = new Date(t.fecha);
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const mesId = await obtenerMesId(anio, mes);

    const neto = t.monto_neto_usd || (t.monto_bruto_usd ? t.monto_bruto_usd / 1.18 : 0);
    const bruto = t.monto_bruto_usd || (t.monto_neto_usd ? t.monto_neto_usd * 1.18 : 0);
    const itbis = bruto - neto;

    const [id] = await db('transacciones').insert({
      mes_id: mesId,
      fecha: t.fecha,
      cliente: t.cliente,
      presupuesto: t.presupuesto || null,
      linea: t.linea || 'SIN_CLASIFICAR',
      tipo_producto: t.tipo_producto || null,
      estatus: t.estatus || 'PENDIENTE',
      monto_bruto_usd: Number(bruto.toFixed(2)),
      monto_neto_usd: Number(neto.toFixed(2)),
      itbis_usd: Number(itbis.toFixed(2)),
      descripcion: t.descripcion || null,
      exento_itbis: t.exento_itbis || false,
    }).returning('id');

    const creada = await db('transacciones').where({ id: id?.id || id }).first();
    res.status(201).json({ transaccion: creada });
  } catch (error) {
    console.error('Error POST /transacciones:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// ============================================================
// RESUMEN ANUAL
// ============================================================

// GET /api/resumen/:anio — resumen anual con cálculos de rentabilidad
router.get('/resumen/:anio', async (req, res) => {
  try {
    const { anio } = req.params;
    const anioInt = parseInt(anio);

    const meses = await db('meses').where({ anio: anioInt }).orderBy('mes', 'asc');
    const metas = await db('metas').where({ anio: anioInt }).first();

    if (meses.length === 0) {
      return res.status(404).json({ error: 'No hay datos para este año' });
    }

    const detallesMeses = await Promise.all(
      meses.map(async (m) => {
        const [transacciones, costos, gastos, kpis, suplidores] = await Promise.all([
          db('transacciones').where({ mes_id: m.id }),
          db('costos_mensuales').where({ mes_id: m.id }).first(),
          db('gastos_mensuales').where({ mes_id: m.id }).first(),
          db('kpis_comerciales').where({ mes_id: m.id }).first(),
          db('suplidores_adicionales').where({ mes_id: m.id }),
        ]);

        const calc = calcularRentabilidadMes(m, transacciones, costos, gastos, kpis, suplidores, metas);
        return {
          mes: m.mes,
          mes_nombre: MESES[m.mes - 1],
          transacciones: transacciones.length,
          ...calc,
        };
      })
    );

    // Totales anuales
    const totales = calcularTotalesAnuales(detallesMeses, metas);

    res.json({
      anio: anioInt,
      meses: detallesMeses,
      totales,
      metas: metas || null,
    });
  } catch (error) {
    console.error('Error GET /resumen/:anio:', error);
    res.status(500).json({ error: 'Error al generar resumen anual' });
  }
});

// ============================================================
// HELPERS
// ============================================================

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

async function upsertMes(anio, mes, tasaCambio) {
  const existing = await db('meses')
    .where({ anio: parseInt(anio), mes: parseInt(mes) })
    .first();

  if (existing) {
    if (tasaCambio !== undefined) {
      await db('meses')
        .where({ id: existing.id })
        .update({ tasa_cambio: tasaCambio, updated_at: db.fn.now() });
    }
    return existing.id;
  }

  const [id] = await db('meses')
    .insert({ anio: parseInt(anio), mes: parseInt(mes), tasa_cambio: tasaCambio || 61 })
    .returning('id');
  return id?.id || id;
}

async function obtenerMesId(anio, mes) {
  const existing = await db('meses').where({ anio, mes }).first();
  if (existing) return existing.id;
  const [id] = await db('meses').insert({ anio, mes, tasa_cambio: 61 }).returning('id');
  return id?.id || id;
}

async function upsertCostos(mesId, data) {
  const existing = await db('costos_mensuales').where({ mes_id: mesId }).first();
  if (existing) {
    await db('costos_mensuales').where({ mes_id: mesId }).update({
      ...data,
      updated_at: db.fn.now(),
    });
  } else {
    await db('costos_mensuales').insert({ mes_id: mesId, ...data });
  }
}

async function upsertGastos(mesId, data) {
  const existing = await db('gastos_mensuales').where({ mes_id: mesId }).first();
  if (existing) {
    await db('gastos_mensuales').where({ mes_id: mesId }).update({
      ...data,
      updated_at: db.fn.now(),
    });
  } else {
    await db('gastos_mensuales').insert({ mes_id: mesId, ...data });
  }
}

async function upsertKPIs(mesId, data) {
  const existing = await db('kpis_comerciales').where({ mes_id: mesId }).first();
  if (existing) {
    await db('kpis_comerciales').where({ mes_id: mesId }).update({
      ...data,
      updated_at: db.fn.now(),
    });
  } else {
    await db('kpis_comerciales').insert({ mes_id: mesId, ...data });
  }
}

// ============================================================
// CÁLCULOS DE RENTABILIDAD
// ============================================================

function calcularRentabilidadMes(
  mesRecord,
  transacciones,
  costos,
  gastos,
  kpis,
  suplidores,
  metas
) {
  const t = mesRecord?.tasa_cambio || 61;

  // Ventas agregadas de transacciones
  let ventasHPSBrutas = 0;
  let ventasImportBrutas = 0;
  let ventasHPSNetas = 0;
  let ventasImportNetas = 0;
  let cobradoBruto = 0;

  transacciones.forEach((tx) => {
    if (tx.linea === 'HPS') {
      ventasHPSBrutas += Number(tx.monto_bruto_usd) || 0;
      ventasHPSNetas += Number(tx.monto_neto_usd) || 0;
    } else if (tx.linea === 'IMPORT') {
      ventasImportBrutas += Number(tx.monto_bruto_usd) || 0;
      ventasImportNetas += Number(tx.monto_neto_usd) || 0;
    }
  });

  const ventasBrutasUSD = ventasHPSBrutas + ventasImportBrutas;
  const ventasNetasUSD = ventasHPSNetas + ventasImportNetas;

  // Costos
  const c = costos || {};
  const comprasAssaUSD = Number(c.assa_abloy_usd || 0) + Number(c.aduanas_usd || 0);
  const otrosUSD = (suplidores || []).reduce((sum, s) => sum + Number(s.valor_usd || 0), 0);
  const totalComprasUSD = comprasAssaUSD + otrosUSD;
  const variacionInvUSD = Number(c.inv_inicial_usd || 0) - Number(c.inv_final_usd || 0);
  const totalCostosUSD = totalComprasUSD + variacionInvUSD;

  // Costos logísticos adicionales
  const costosLogisticosUSD =
    Number(c.flete_usd || 0) +
    Number(c.seguro_carga_usd || 0) +
    Number(c.almacenaje_usd || 0) +
    Number(c.transporte_local_usd || 0) +
    Number(c.arancel_usd || 0);

  const totalCostosConLogisticaUSD = totalCostosUSD + costosLogisticosUSD;

  // Margen Bruto
  const margenBrutoUSD = ventasNetasUSD - totalCostosConLogisticaUSD;
  const margenBrutoPct = ventasNetasUSD > 0 ? (margenBrutoUSD / ventasNetasUSD) * 100 : 0;

  // Gastos
  const g = gastos || {};
  const gastosFijosUSD =
    Number(g.combustible_usd || 0) +
    Number(g.intereses_usd || 0) +
    Number(g.telefonos_usd || 0) +
    Number(g.electricidad_usd || 0) +
    Number(g.depreciacion_usd || 0) +
    Number(g.seguros_usd || 0);

  const gastosFijosRD =
    Number(g.nomina_rd || 0) +
    Number(g.caja_chica_rd || 0) +
    Number(g.eventos_rd || 0) +
    Number(g.correos_rd || 0) +
    Number(g.seguro_guagua_rd || 0) +
    Number(g.comb_alejandro_rd || 0) +
    Number(g.viajes_rd || 0);

  const gastosFijosUSDFromRD = t > 0 ? gastosFijosRD / t : 0;
  const totalGastosUSD = gastosFijosUSD + gastosFijosUSDFromRD;

  // EBIT
  const ebitUSD = margenBrutoUSD - totalGastosUSD;

  // ISR
  const isrTasa = metas ? Number(metas.isr_tasa) || 27 : 27;
  const isrUSD = ebitUSD > 0 ? (ebitUSD * isrTasa) / 100 : 0;

  // Neto Devengado
  const netoUSD = ebitUSD - isrUSD;
  const margenNetoPct = ventasNetasUSD > 0 ? (netoUSD / ventasNetasUSD) * 100 : 0;

  // Flujo de Caja (por ahora mismo que devengado, se reemplaza cuando cobradoBruto real exista)
  // Nota: cobradoBruto no está en transacciones actualmente; usar 0 si no hay
  const cobradoNeto = cobradoBruto > 0 ? cobradoBruto / 1.18 : 0;
  const margenBrutoCaja = cobradoNeto - totalCostosConLogisticaUSD;
  const ebitCaja = margenBrutoCaja - totalGastosUSD;
  const isrCaja = ebitCaja > 0 ? (ebitCaja * isrTasa) / 100 : 0;
  const netoCaja = ebitCaja - isrCaja;

  // KPIs comerciales
  const k = kpis || {};
  const totalVisitas = k.total_visitas || 0;
  const cantPresupuestos = k.cant_presupuestos || 0;
  const cantAprobados = k.cant_aprobados || 0;
  const montoPresupuestadoUSD = k.monto_presupuestado_usd || 0;
  const valorCerradoUSD = k.valor_cerrado_usd || 0;

  const tasaConversionVisitas = totalVisitas > 0 ? (cantPresupuestos / totalVisitas) * 100 : 0;
  const tasaAprobacion = cantPresupuestos > 0 ? (cantAprobados / cantPresupuestos) * 100 : 0;
  const tasaCierreValor = montoPresupuestadoUSD > 0 ? (valorCerradoUSD / montoPresupuestadoUSD) * 100 : 0;

  // Cumplimiento de meta
  const metaAnualUSD = metas ? Number(metas.meta_anual_usd) || 1250000 : 1250000;
  const metaMensualUSD = metaAnualUSD / 12;
  const cumplimientoMeta = metaMensualUSD > 0 ? (ventasNetasUSD / metaMensualUSD) * 100 : 0;

  return {
    ventasHPSBrutas: Number(ventasHPSBrutas.toFixed(2)),
    ventasImportBrutas: Number(ventasImportBrutas.toFixed(2)),
    ventasBrutasUSD: Number(ventasBrutasUSD.toFixed(2)),
    ventasNetasUSD: Number(ventasNetasUSD.toFixed(2)),
    comprasAssaUSD: Number(comprasAssaUSD.toFixed(2)),
    otrosSuplidoresUSD: Number(otrosUSD.toFixed(2)),
    totalComprasUSD: Number(totalComprasUSD.toFixed(2)),
    costosLogisticosUSD: Number(costosLogisticosUSD.toFixed(2)),
    totalCostosUSD: Number(totalCostosConLogisticaUSD.toFixed(2)),
    variacionInvUSD: Number(variacionInvUSD.toFixed(2)),
    margenBrutoUSD: Number(margenBrutoUSD.toFixed(2)),
    margenBrutoPct: Number(margenBrutoPct.toFixed(1)),
    gastosFijosUSD: Number(gastosFijosUSD.toFixed(2)),
    gastosFijosRD: Number(gastosFijosRD.toFixed(2)),
    gastosFijosUSDFromRD: Number(gastosFijosUSDFromRD.toFixed(2)),
    totalGastosUSD: Number(totalGastosUSD.toFixed(2)),
    ebitUSD: Number(ebitUSD.toFixed(2)),
    isrUSD: Number(isrUSD.toFixed(2)),
    netoUSD: Number(netoUSD.toFixed(2)),
    margenNetoPct: Number(margenNetoPct.toFixed(1)),
    cobradoBruto: Number(cobradoBruto.toFixed(2)),
    cobradoNeto: Number(cobradoNeto.toFixed(2)),
    margenBrutoCaja: Number(margenBrutoCaja.toFixed(2)),
    ebitCaja: Number(ebitCaja.toFixed(2)),
    isrCaja: Number(isrCaja.toFixed(2)),
    netoCaja: Number(netoCaja.toFixed(2)),
    totalVisitas,
    cantPresupuestos,
    cantAprobados,
    montoPresupuestadoUSD: Number(montoPresupuestadoUSD.toFixed(2)),
    valorCerradoUSD: Number(valorCerradoUSD.toFixed(2)),
    tasaConversionVisitas: Number(tasaConversionVisitas.toFixed(1)),
    tasaAprobacion: Number(tasaAprobacion.toFixed(1)),
    tasaCierreValor: Number(tasaCierreValor.toFixed(1)),
    metaMensualUSD: Number(metaMensualUSD.toFixed(2)),
    cumplimientoMeta: Number(cumplimientoMeta.toFixed(1)),
  };
}

function calcularTotalesAnuales(detallesMeses, metas) {
  const totales = {
    ventasBrutasUSD: 0,
    ventasNetasUSD: 0,
    totalCostosUSD: 0,
    margenBrutoUSD: 0,
    totalGastosUSD: 0,
    ebitUSD: 0,
    isrUSD: 0,
    netoUSD: 0,
    gastosFijosRD: 0,
    netoCaja: 0,
    totalPresupuestos: 0,
    totalAprobados: 0,
    totalMontoPresupuestadoUSD: 0,
    totalValorCerradoUSD: 0,
  };

  detallesMeses.forEach((m) => {
    totales.ventasBrutasUSD += m.ventasBrutasUSD;
    totales.ventasNetasUSD += m.ventasNetasUSD;
    totales.totalCostosUSD += m.totalCostosUSD;
    totales.margenBrutoUSD += m.margenBrutoUSD;
    totales.totalGastosUSD += m.totalGastosUSD;
    totales.ebitUSD += m.ebitUSD;
    totales.isrUSD += m.isrUSD;
    totales.netoUSD += m.netoUSD;
    totales.gastosFijosRD += m.gastosFijosRD;
    totales.netoCaja += m.netoCaja;
    totales.totalPresupuestos += m.cantPresupuestos;
    totales.totalAprobados += m.cantAprobados;
    totales.totalMontoPresupuestadoUSD += m.montoPresupuestadoUSD;
    totales.totalValorCerradoUSD += m.valorCerradoUSD;
  });

  const metaAnualUSD = metas ? Number(metas.meta_anual_usd) || 1250000 : 1250000;

  return {
    ...totales,
    margenBrutoPct: totales.ventasNetasUSD > 0
      ? Number(((totales.margenBrutoUSD / totales.ventasNetasUSD) * 100).toFixed(1))
      : 0,
    margenNetoPct: totales.ventasNetasUSD > 0
      ? Number(((totales.netoUSD / totales.ventasNetasUSD) * 100).toFixed(1))
      : 0,
    cumplimientoMetaAnual: Number(((totales.ventasNetasUSD / metaAnualUSD) * 100).toFixed(1)),
    metaAnualUSD: Number(metaAnualUSD.toFixed(2)),
    tasaAprobacionGeneral: totales.totalPresupuestos > 0
      ? Number(((totales.totalAprobados / totales.totalPresupuestos) * 100).toFixed(1))
      : 0,
  };
}

export default router;
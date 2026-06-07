/**
 * Seed: 005_transacciones
 * Datos de ejemplo — transacciones mensuales de los dashboards originales
 */
export async function seed(knex) {
  const meses = await knex('meses').select('id', 'mes', 'anio').where({ anio: 2026 });
  const m = {};
  meses.forEach((r) => { m[r.mes] = r.id; });

  await knex('transacciones').del();

  const txns = [];

  // Enero — datos del index_5
  const eneData = [
    { linea: 'HPS', montoBruto: 79208.06 },
    { linea: 'IMPORT', montoBruto: 83204.50 },
  ];
  eneData.forEach((d) => {
    const bruto = d.montoBruto;
    const neto = bruto / 1.18;
    const itbis = bruto - neto;
    txns.push({
      mes_id: m[1],
      fecha: '2026-01-15',
      cliente: 'CLIENTE VARIOS',
      presupuesto: 'ENE-001',
      linea: d.linea,
      tipo_producto: d.linea === 'HPS' ? 'S' : 'P',
      estatus: 'APROBADO',
      monto_bruto_usd: bruto,
      monto_neto_usd: Number(neto.toFixed(2)),
      itbis_usd: Number(itbis.toFixed(2)),
      exento_itbis: false,
    });
  });

  // Febrero
  const febData = [
    { linea: 'HPS', montoBruto: 94903.02 },
    { linea: 'IMPORT', montoBruto: 11542.46 },
  ];
  febData.forEach((d) => {
    const bruto = d.montoBruto;
    const neto = bruto / 1.18;
    const itbis = bruto - neto;
    txns.push({
      mes_id: m[2],
      fecha: '2026-02-15',
      cliente: 'CLIENTE VARIOS',
      presupuesto: 'FEB-001',
      linea: d.linea,
      tipo_producto: d.linea === 'HPS' ? 'S' : 'P',
      estatus: 'APROBADO',
      monto_bruto_usd: bruto,
      monto_neto_usd: Number(neto.toFixed(2)),
      itbis_usd: Number(itbis.toFixed(2)),
      exento_itbis: false,
    });
  });

  // Marzo
  const marData = [
    { linea: 'HPS', montoBruto: 469903.95 },
    { linea: 'IMPORT', montoBruto: 48986.18 },
  ];
  marData.forEach((d) => {
    const bruto = d.montoBruto;
    const neto = bruto / 1.18;
    const itbis = bruto - neto;
    txns.push({
      mes_id: m[3],
      fecha: '2026-03-15',
      cliente: 'CLIENTE VARIOS',
      presupuesto: 'MAR-001',
      linea: d.linea,
      tipo_producto: d.linea === 'HPS' ? 'S' : 'P',
      estatus: 'APROBADO',
      monto_bruto_usd: bruto,
      monto_neto_usd: Number(neto.toFixed(2)),
      itbis_usd: Number(itbis.toFixed(2)),
      exento_itbis: false,
    });
  });

  // Abril
  const abrData = [
    { linea: 'HPS', montoBruto: 226107.61 },
    { linea: 'IMPORT', montoBruto: 17436.43 },
  ];
  abrData.forEach((d) => {
    const bruto = d.montoBruto;
    const neto = bruto / 1.18;
    const itbis = bruto - neto;
    txns.push({
      mes_id: m[4],
      fecha: '2026-04-15',
      cliente: 'CLIENTE VARIOS',
      presupuesto: 'ABR-001',
      linea: d.linea,
      tipo_producto: d.linea === 'HPS' ? 'S' : 'P',
      estatus: 'APROBADO',
      monto_bruto_usd: bruto,
      monto_neto_usd: Number(neto.toFixed(2)),
      itbis_usd: Number(itbis.toFixed(2)),
      exento_itbis: false,
    });
  });

  await knex('transacciones').insert(txns);
}
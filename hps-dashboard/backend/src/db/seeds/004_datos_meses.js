/**
 * Seed: 004_datos_meses
 * Datos iniciales de precarga (Enero, Febrero, Marzo, Abril, Mayo del index_5)
 */
export async function seed(knex) {
  // Obtener IDs de los meses
  const meses = await knex('meses').select('id', 'mes', 'anio').where({ anio: 2026 });
  const m = {};
  meses.forEach((r) => { m[r.mes] = r.id; });

  // Costos mensuales
  await knex('costos_mensuales').del();
  await knex('costos_mensuales').insert([
    { mes_id: m[1], assa_abloy_usd: 0, aduanas_usd: 2385.94, inv_inicial_usd: 0, inv_final_usd: 0 },
    { mes_id: m[2], assa_abloy_usd: 20000, aduanas_usd: 1628.46, inv_inicial_usd: 0, inv_final_usd: 0 },
    { mes_id: m[3], assa_abloy_usd: 15000, aduanas_usd: 5474.99, inv_inicial_usd: 0, inv_final_usd: 0 },
    { mes_id: m[4], assa_abloy_usd: 0, aduanas_usd: 0, inv_inicial_usd: 0, inv_final_usd: 0 },
  ]);

  // Suplidores adicionales
  await knex('suplidores_adicionales').del();
  await knex('suplidores_adicionales').insert([
    { mes_id: m[1], nombre: 'APLIK INGENIERIA', valor_usd: 902.18 },
    { mes_id: m[1], nombre: 'COMPRAS POR INTERNET', valor_usd: 1238.40 },
    { mes_id: m[2], nombre: 'APLIK INGENIERIA', valor_usd: 827.01 },
    { mes_id: m[2], nombre: 'ENKOA SYSTEM', valor_usd: 3764.74 },
    { mes_id: m[2], nombre: 'TALLERES GARCIA', valor_usd: 156.21 },
    { mes_id: m[2], nombre: 'COMPRAS POR INTERNET', valor_usd: 436.56 },
    { mes_id: m[3], nombre: 'APLIK INGENIERIA', valor_usd: 1986.38 },
    { mes_id: m[3], nombre: 'SCAR SERVICE', valor_usd: 1072.45 },
    { mes_id: m[3], nombre: 'CAMERSA', valor_usd: 66.01 },
    { mes_id: m[3], nombre: 'ORBITA TECHNOLOGY', valor_usd: 3940 },
    { mes_id: m[3], nombre: 'COMPRAS POR INTERNET', valor_usd: 4300 },
  ]);

  // Gastos mensuales
  await knex('gastos_mensuales').del();
  await knex('gastos_mensuales').insert([
    {
      mes_id: m[1],
      nomina_rd: 585367.36, caja_chica_rd: 9719.35, eventos_rd: 28450, correos_rd: 4091.25,
      seguro_guagua_rd: 3683.71, combustible_usd: 270, intereses_usd: 49.76, comb_alejandro_rd: 10000,
      telefonos_usd: 63.17, viajes_rd: 136906, electricidad_usd: 144.42, depreciacion_usd: 72.17, seguros_usd: 45.57,
    },
    {
      mes_id: m[2],
      nomina_rd: 566641.03, caja_chica_rd: 18052.18, eventos_rd: 28450, correos_rd: 4091.25,
      seguro_guagua_rd: 3683.71, combustible_usd: 270, intereses_usd: 49.76, comb_alejandro_rd: 10000,
      telefonos_usd: 63.17, viajes_rd: 257485.30, electricidad_usd: 144.42, depreciacion_usd: 72.17, seguros_usd: 45.57,
    },
    {
      mes_id: m[3],
      nomina_rd: 520572.97, caja_chica_rd: 18700.46, eventos_rd: 28450, correos_rd: 4091.25,
      seguro_guagua_rd: 3683.71, combustible_usd: 270, intereses_usd: 49.76, comb_alejandro_rd: 10000,
      telefonos_usd: 63.17, viajes_rd: 172161.58, electricidad_usd: 144.42, depreciacion_usd: 72.17, seguros_usd: 45.57,
    },
    {
      mes_id: m[4],
      nomina_rd: 0, caja_chica_rd: 0, eventos_rd: 28450, correos_rd: 4091.25,
      seguro_guagua_rd: 3683.71, combustible_usd: 270, intereses_usd: 49.76, comb_alejandro_rd: 10000,
      telefonos_usd: 63.17, viajes_rd: 0, electricidad_usd: 144.42, depreciacion_usd: 72.17, seguros_usd: 45.57,
    },
  ]);

  // KPIs comerciales
  await knex('kpis_comerciales').del();
  await knex('kpis_comerciales').insert([
    { mes_id: m[1], total_visitas: 45, pct_presencial: 40, pct_llamadas: 35, pct_emails: 25, cant_presupuestos: 22, monto_presupuestado_usd: 185000, cant_aprobados: 8, valor_cerrado_usd: 137637.76 },
    { mes_id: m[2], total_visitas: 52, pct_presencial: 35, pct_llamadas: 40, pct_emails: 25, cant_presupuestos: 28, monto_presupuestado_usd: 210000, cant_aprobados: 11, valor_cerrado_usd: 90208.46 },
    { mes_id: m[3], total_visitas: 38, pct_presencial: 50, pct_llamadas: 30, pct_emails: 20, cant_presupuestos: 15, monto_presupuestado_usd: 520000, cant_aprobados: 6, valor_cerrado_usd: 439737.40 },
    { mes_id: m[4], total_visitas: 0, pct_presencial: 0, pct_llamadas: 0, pct_emails: 0, cant_presupuestos: 128, monto_presupuestado_usd: 1162891.13, cant_aprobados: 42, valor_cerrado_usd: 243544.04 },
  ]);
}
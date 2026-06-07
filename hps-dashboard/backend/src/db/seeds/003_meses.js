/**
 * Seed: 003_meses
 * 12 meses para 2026 con datos de precarga del index_5
 */
const mesesData = [
  {
    anio: 2026, mes: 1, tasa_cambio: 63,
  },
  {
    anio: 2026, mes: 2, tasa_cambio: 62,
  },
  {
    anio: 2026, mes: 3, tasa_cambio: 61,
  },
  {
    anio: 2026, mes: 4, tasa_cambio: 61,
  },
  { anio: 2026, mes: 5, tasa_cambio: 61 },
  { anio: 2026, mes: 6, tasa_cambio: 61 },
  { anio: 2026, mes: 7, tasa_cambio: 61 },
  { anio: 2026, mes: 8, tasa_cambio: 61 },
  { anio: 2026, mes: 9, tasa_cambio: 61 },
  { anio: 2026, mes: 10, tasa_cambio: 61 },
  { anio: 2026, mes: 11, tasa_cambio: 61 },
  { anio: 2026, mes: 12, tasa_cambio: 61 },
];

export async function seed(knex) {
  await knex('meses').del();
  await knex('meses').insert(mesesData);
}
/**
 * Seed: 002_metas
 * Meta anual 2026
 */
export async function seed(knex) {
  await knex('metas').del();
  await knex('metas').insert([
    {
      anio: 2026,
      meta_anual_usd: 1250000,
      isr_tasa: 27,
      itbis_tasa: 18,
    },
  ]);
}
/**
 * Migration: 002_create_metas
 * Metas anuales y configuración general
 */
export function up(knex) {
  return knex.schema.createTable('metas', (table) => {
    table.increments('id').primary();
    table.integer('anio').notNullable().unique();
    table.decimal('meta_anual_usd', 14, 2).notNullable().defaultTo(1250000);
    table.decimal('isr_tasa', 5, 2).notNullable().defaultTo(27);
    table.decimal('itbis_tasa', 5, 2).notNullable().defaultTo(18);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('metas');
}
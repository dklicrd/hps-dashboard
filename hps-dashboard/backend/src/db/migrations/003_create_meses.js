/**
 * Migration: 003_create_meses
 * Registro de meses por año (12 por anio)
 */
export function up(knex) {
  return knex.schema.createTable('meses', (table) => {
    table.increments('id').primary();
    table.integer('anio').notNullable();
    table.integer('mes').notNullable().checkBetween([1, 12]);
    table.decimal('tasa_cambio', 8, 2).notNullable().defaultTo(61);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['anio', 'mes']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('meses');
}
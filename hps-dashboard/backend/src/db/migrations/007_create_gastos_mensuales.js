/**
 * Migration: 007_create_gastos_mensuales
 * Gastos administrativos mensuales (RD$ y US$)
 */
export function up(knex) {
  return knex.schema.createTable('gastos_mensuales', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().unique().references('id').inTable('meses').onDelete('CASCADE');
    table.decimal('nomina_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('caja_chica_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('eventos_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('correos_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('seguro_guagua_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('combustible_usd', 10, 2).notNullable().defaultTo(0);
    table.decimal('intereses_usd', 10, 2).notNullable().defaultTo(0);
    table.decimal('comb_alejandro_rd', 10, 2).notNullable().defaultTo(0);
    table.decimal('telefonos_usd', 10, 2).notNullable().defaultTo(0);
    table.decimal('viajes_rd', 12, 2).notNullable().defaultTo(0);
    table.decimal('electricidad_usd', 10, 2).notNullable().defaultTo(0);
    table.decimal('depreciacion_usd', 10, 2).notNullable().defaultTo(0);
    table.decimal('seguros_usd', 10, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('gastos_mensuales');
}
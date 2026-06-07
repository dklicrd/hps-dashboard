/**
 * Migration: 005_create_costos_mensuales
 * Costos fijos mensuales (suplidores, logística, inventarios)
 */
export function up(knex) {
  return knex.schema.createTable('costos_mensuales', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().unique().references('id').inTable('meses').onDelete('CASCADE');
    table.decimal('assa_abloy_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('aduanas_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('inv_inicial_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('inv_final_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('flete_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('seguro_carga_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('almacenaje_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('transporte_local_usd', 12, 2).notNullable().defaultTo(0);
    table.decimal('arancel_usd', 12, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('costos_mensuales');
}
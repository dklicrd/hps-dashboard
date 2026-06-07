/**
 * Migration: 006_create_suplidores_adicionales
 * Suplidores adicionales dinámicos por mes (1:N)
 */
export function up(knex) {
  return knex.schema.createTable('suplidores_adicionales', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().references('id').inTable('meses').onDelete('CASCADE');
    table.string('nombre', 255).notNullable();
    table.decimal('valor_usd', 12, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('suplidores_adicionales');
}
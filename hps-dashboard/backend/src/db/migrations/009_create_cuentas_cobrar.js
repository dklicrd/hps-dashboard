/**
 * Migration: 009_create_cuentas_cobrar
 * Cuentas por cobrar con antigüedad
 */
export function up(knex) {
  return knex.schema.createTable('cuentas_cobrar', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().references('id').inTable('meses').onDelete('CASCADE');
    table.string('cliente', 255).notNullable();
    table.decimal('monto_pendiente_usd', 12, 2).notNullable().defaultTo(0);
    table.integer('dias_vencido').notNullable().defaultTo(0);
    table.string('factura_ref', 100);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('cuentas_cobrar');
}
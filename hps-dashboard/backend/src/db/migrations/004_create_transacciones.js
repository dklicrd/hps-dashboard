/**
 * Migration: 004_create_transacciones
 * Transacciones individuales (facturas/ingresos)
 */
export function up(knex) {
  return knex.schema.createTable('transacciones', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().references('id').inTable('meses').onDelete('CASCADE');
    table.date('fecha').notNullable();
    table.string('cliente', 255).notNullable();
    table.string('presupuesto', 100);
    table.enu('linea', ['HPS', 'IMPORT', 'SIN_CLASIFICAR']).notNullable().defaultTo('SIN_CLASIFICAR');
    table.enu('tipo_producto', ['P', 'S']);
    table.enu('estatus', ['APROBADO', 'NO_APROBADO', 'PENDIENTE']).notNullable().defaultTo('PENDIENTE');
    table.decimal('monto_bruto_usd', 12, 2).notNullable();
    table.decimal('monto_neto_usd', 12, 2).notNullable();
    table.decimal('itbis_usd', 12, 2).notNullable();
    table.text('descripcion');
    table.boolean('exento_itbis').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('transacciones');
}
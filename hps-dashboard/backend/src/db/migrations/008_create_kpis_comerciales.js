/**
 * Migration: 008_create_kpis_comerciales
 * KPIs comerciales mensuales (visitas, presupuestos, aprobaciones)
 */
export function up(knex) {
  return knex.schema.createTable('kpis_comerciales', (table) => {
    table.increments('id').primary();
    table.integer('mes_id').unsigned().notNullable().unique().references('id').inTable('meses').onDelete('CASCADE');
    table.integer('total_visitas').notNullable().defaultTo(0);
    table.decimal('pct_presencial', 5, 2).notNullable().defaultTo(0);
    table.decimal('pct_llamadas', 5, 2).notNullable().defaultTo(0);
    table.decimal('pct_emails', 5, 2).notNullable().defaultTo(0);
    table.integer('cant_presupuestos').notNullable().defaultTo(0);
    table.decimal('monto_presupuestado_usd', 14, 2).notNullable().defaultTo(0);
    table.integer('cant_aprobados').notNullable().defaultTo(0);
    table.decimal('valor_cerrado_usd', 14, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('kpis_comerciales');
}
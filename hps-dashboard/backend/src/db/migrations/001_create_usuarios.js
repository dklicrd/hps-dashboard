/**
 * Migration: 001_create_usuarios
 * Tabla de usuarios del sistema con roles
 */
export function up(knex) {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enu('rol', ['admin', 'gerente', 'invitado']).notNullable().defaultTo('invitado');
    table.string('nombre', 150).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('usuarios');
}
/**
 * Seed: 001_usuarios
 * Usuarios iniciales del sistema
 */
import bcrypt from 'bcrypt';

export async function seed(knex) {
  await knex('usuarios').del();

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  await knex('usuarios').insert([
    {
      username: 'admin',
      password_hash: hash('admin123'),
      rol: 'admin',
      nombre: 'Administrador',
    },
    {
      username: 'gerente',
      password_hash: hash('gerente123'),
      rol: 'admin',
      nombre: 'Gerente',
    },
    {
      username: 'invitado',
      password_hash: hash('invitado'),
      rol: 'invitado',
      nombre: 'Invitado',
    },
  ]);
}
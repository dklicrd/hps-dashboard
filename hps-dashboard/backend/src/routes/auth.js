/**
 * Route: /api/auth
 * Login y autenticación
 */
import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import { generarToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const user = await db('usuarios')
      .where({ username: username.toLowerCase().trim() })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, user.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generarToken(user);

    res.json({
      token,
      usuario: {
        id: user.id,
        username: user.username,
        rol: user.rol,
        nombre: user.nombre,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me — Obtener usuario actual
import { verificarToken } from '../middleware/auth.js';

router.get('/me', verificarToken, async (req, res) => {
  try {
    const user = await db('usuarios')
      .select('id', 'username', 'rol', 'nombre')
      .where({ id: req.usuario.id })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: user });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
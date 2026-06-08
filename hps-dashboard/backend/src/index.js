/**
 * Entry point: Servidor Express HPS-Dashboard API
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import db from './db/connection.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = parseInt(process.env.PORT || process.env.NODE_PORT || '3001');
const env = process.env.NODE_ENV || 'development';

// Middleware global
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env,
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Servir frontend estático en producción
const __dirname = new URL('.', import.meta.url).pathname;
const publicPath = path.join(__dirname, '../public');
if (env === 'production') {
  app.use(express.static(publicPath));
  // SPA fallback: todas las rutas no-API sirven index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Auto-migrate on startup, then start listening
async function start() {
  try {
    console.log('🔄 Running migrations...');
    await db.migrate.latest();
    console.log('✅ Migrations applied');

    console.log('🌱 Running seeds...');
    await db.seed.run();
    console.log('✅ Seeds applied');
  } catch (err) {
    console.warn('⚠️  Migration/seed error (DB may not be ready):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`📊 HPS-Dashboard API corriendo en puerto ${PORT}`);
    console.log(`   Entorno: ${env}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start();
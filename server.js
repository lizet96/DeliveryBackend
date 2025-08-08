const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de Supabase para verificar conexión
const supabase = require('./src/config/supabase');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const packageRoutes = require('./src/routes/packageRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/packages', packageRoutes);

// Socket.IO para tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('location-update', (data) => {
    // Broadcast a todos los admins
    socket.broadcast.emit('location-received', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Función para verificar conexión a Supabase
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Error conectando a Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa!');
    console.log(`📊 Base de datos configurada correctamente`);
    return true;
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:4200`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  
  // Verificar conexión a base de datos
  await testDatabaseConnection();
  
  console.log('\n📋 Rutas disponibles:');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/users');
  console.log('   GET  /api/locations');
  console.log('   GET  /api/packages');
  console.log('\n🔌 Socket.IO configurado para tiempo real');
});
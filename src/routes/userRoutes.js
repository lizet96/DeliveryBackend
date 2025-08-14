const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/users/delivery - Obtener usuarios delivery
router.get('/delivery', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, status')
      .eq('role', 'delivery');

    if (error) {
      console.error('Error fetching delivery users:', error);
      return res.status(500).json({ error: 'Error al obtener usuarios delivery' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'User routes working' });
});

module.exports = router;
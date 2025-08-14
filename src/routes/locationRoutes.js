const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/', (req, res) => {
  res.json({ message: 'Location routes working' });
});

// Obtener ubicaciones de un repartidor
router.get('/delivery/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('delivery_locations')
      .select('*')
      .eq('delivery_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las ubicaciones recientes
router.get('/recent', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('delivery_locations')
      .select(`
        *,
        users!delivery_user_id(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { delivery_user_id, latitude, longitude } = req.body;
    
    const { data, error } = await supabase
      .from('delivery_locations')
      .insert({ delivery_user_id, latitude, longitude })
      .select();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/packages - Obtener todos los paquetes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        assigned_user:users!assigned_to(id, username, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return res.status(500).json({ error: 'Error al obtener paquetes' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/packages/delivery/:userId - Obtener paquetes asignados a un delivery específico
router.get('/delivery/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        assigned_user:users!assigned_to(id, username, status)
      `)
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery packages:', error);
      return res.status(500).json({ error: 'Error al obtener paquetes del delivery' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/packages - Crear nuevo paquete
router.post('/', async (req, res) => {
  try {
    const {
      delivery_address,
      assigned_to,
      status = 'En transito'
    } = req.body;

    // Validaciones básicas
    if (!delivery_address) {
      return res.status(400).json({ 
        error: 'El campo delivery_address es requerido' 
      });
    }

    // Crear el paquete según tu estructura de BD
    const packageData = {
      delivery_address,
      status
    };

    // Si se asignó un usuario delivery, agregarlo
    if (assigned_to) {
      packageData.assigned_to = assigned_to;
    }

    const { data: packageResult, error: packageError } = await supabase
      .from('packages')
      .insert(packageData)
      .select(`
        *,
        assigned_user:users!assigned_to(id, username, status)
      `)
      .single();

    if (packageError) {
      console.error('Error creating package:', packageError);
      return res.status(500).json({ error: 'Error al crear paquete' });
    }

    res.status(201).json(packageResult);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/packages/:id/status - Actualizar estado del paquete
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el status sea válido
    const validStatuses = ['En transito', 'Entregado', 'Regresado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Debe ser: En transito, Entregado, o Regresado' 
      });
    }

    const { data, error } = await supabase
      .from('packages')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        assigned_user:users!assigned_to(id, username, status)
      `)
      .single();

    if (error) {
      console.error('Error updating package status:', error);
      return res.status(500).json({ error: 'Error al actualizar estado del paquete' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
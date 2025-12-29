const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');


router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  res.json(data);
});


module.exports = router
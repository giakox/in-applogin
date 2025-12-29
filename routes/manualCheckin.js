const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.patch('/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  const { data, error } = await supabase
    .from('tickets')
    .update({
      used: true,
      used_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .eq('used', false)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ error: 'ALREADY_USED' });
  }

  res.json({ ok: true });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.patch('/', async (req, res) => {
  const codeQr = req.body.code;

  if (!codeQr) {
    return res.status(400).json({ error: 'MISSING_CODE' });
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({
      used: true,
      used_at: new Date().toISOString()
    })
    .eq('code', codeQr)
    .eq('used', false)
    .select()
    .single();

  if (error || !data) {
    return res.status(400).json({ error: 'INVALID_OR_ALREADY_USED' });
  }

  return res.status(200).json({ ok: true });
});

module.exports = router;


module.exports = router
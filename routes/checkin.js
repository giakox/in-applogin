const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.patch('/', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'MISSING_CODE' });
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('code', code)
      .eq('used', false)
      .select(`
        id,
        people (
          nome,
          cognome,
          telefono,
          referente,
          incassato
        )
      `)
      .single();

    if (error || !data || !data.people) {
      return res.status(400).json({ error: 'INVALID_OR_ALREADY_USED' });
    }

    return res.status(200).json({
      ok: true,
      person: data.people
    });

  } catch (err) {
    console.error('CHECKIN ERROR', err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
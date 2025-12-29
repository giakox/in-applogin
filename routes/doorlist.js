const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      used,
      person_id,
      people (
        nome,
        cognome
      )
    `);

  if (error) {
    console.error('DOORLIST ERROR', error);
    return res.status(500).json({ error: 'LOAD_FAILED' });
  }

  // 🔑 FILTRIAMO TUTTO QUELLO CHE È ROTTO
  const clean = (data || [])
    .filter(t => t.people)
    .map(t => ({
      ticketId: t.id,
      used: t.used,
      nome: t.people.nome,
      cognome: t.people.cognome
    }));

  res.json(clean);
});

module.exports = router;
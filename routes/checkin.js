const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.patch('/', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'MISSING_CODE' });
    }

    // 1️⃣ trova ticket + persona
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        id,
        used,
        person_id,
        people (
          nome,
          cognome,
          telefono,
          referente,
          ritirato_da,
          incassato,
          inviti
        )
      `)
      .eq('code', code)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'INVALID' });
    }

    // 2️⃣ conta ingressi già fatti
    const { count: usedCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', ticket.person_id)
      .eq('used', true);

    const alreadyUsed = ticket.used;

    // 3️⃣ segna ingresso se valido
    if (!alreadyUsed) {
      await supabase
        .from('tickets')
        .update({
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);
    }

    return res.json({
      ok: !alreadyUsed,
      error: alreadyUsed ? 'ALREADY_USED' : null,
      person: {
        nome: ticket.people.nome,
        cognome: ticket.people.cognome,
        telefono: ticket.people.telefono,
        referente: ticket.people.referente,
        ritiratoDa: ticket.people.ritirato_da,
        incassato: ticket.people.incassato,
        ingresso: `${alreadyUsed ? usedCount : usedCount + 1}/${ticket.people.inviti}`
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
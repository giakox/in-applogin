const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.patch('/', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'MISSING_CODE' });
    }

    // 1️⃣ cerchiamo il ticket + persona
    const { data: ticket, error: findError } = await supabase
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
          incassato,
          inviti
        )
      `)
      .eq('code', code)
      .single();

    if (findError || !ticket) {
      return res.status(404).json({ error: 'INVALID' });
    }

    // 2️⃣ contiamo quanti ingressi ha già fatto questa persona
    const { count: usedCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', ticket.person_id)
      .eq('used', true);

    // 3️⃣ se NON è ancora usato → lo segniamo
    let alreadyUsed = ticket.used;

    if (!ticket.used) {
      await supabase
        .from('tickets')
        .update({
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);
    }

    // 4️⃣ risposta SEMPRE completa
    return res.json({
      ok: !alreadyUsed,
      error: alreadyUsed ? 'ALREADY_USED' : null,
      person: {
        nome: ticket.people.nome,
        cognome: ticket.people.cognome,
        telefono: ticket.people.telefono,
        referente: ticket.people.referente,
        incassato: ticket.people.incassato,
        ingresso: `${alreadyUsed ? usedCount : usedCount + 1}/${ticket.people.inviti}`
      }
    });

  } catch (err) {
    console.error('CHECKIN ERROR', err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
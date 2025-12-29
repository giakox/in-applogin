const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { count: total, error: totalError } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true });

  const { count: checkedIn, error: checkedError } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('used', true);

  if (totalError || checkedError) {
    return res.status(500).json({ error: 'STATS_ERROR' });
  }

  res.json({
    total,
    checkedIn,
    remaining: total - checkedIn
  });
});

module.exports = router;




module.exports = router
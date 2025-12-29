const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { count: total } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true });

  const { count: checkedIn } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('used', true);

  res.json({
    total,
    checkedIn,
    remaining: total - checkedIn
  });
});

module.exports = router;
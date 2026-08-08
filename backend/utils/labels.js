const LABELS = {
  birthday_prayer: 'Birthday Prayer',
  marriage_anniversary: 'Marriage Anniversary',
  thanksgiving_prayer: 'Thanksgiving Prayer',
  house_warming: 'House Warming',
  healing_prayer: 'Healing Prayer',
  family_prayer: 'Family Prayer',
  dedication: 'Dedication / Blessing',
  other_occasion: 'Other Occasion',
};

function eventTypeLabel(value) {
  return LABELS[value] || String(value || 'Occasion').replace(/_/g, ' ');
}

module.exports = { eventTypeLabel, LABELS };

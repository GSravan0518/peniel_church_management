export const EVENT_TYPES = [
  { value: 'birthday_prayer', label: 'Birthday Prayer' },
  { value: 'marriage_anniversary', label: 'Marriage Anniversary' },
  { value: 'thanksgiving_prayer', label: 'Thanksgiving Prayer' },
  { value: 'house_warming', label: 'House Warming' },
  { value: 'healing_prayer', label: 'Healing Prayer' },
  { value: 'family_prayer', label: 'Family Prayer' },
  { value: 'dedication', label: 'Dedication / Blessing' },
  { value: 'other_occasion', label: 'Other Occasion' },
];

export const eventTypeLabel = (value) =>
  EVENT_TYPES.find((t) => t.value === value)?.label || value || 'Occasion';

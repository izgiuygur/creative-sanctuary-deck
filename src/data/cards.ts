import type { OracleCard, Element, ElementFilter } from '../types/card';

export const cards: OracleCard[] = [
  // --- EARTH (10 cards) ---
  { id: 'earth-grounded', word: 'Grounded', quote: 'Cultivate inner calm by anchoring yourself in the here and now.', element: 'earth', svgPath: 'earth/grounded.svg', order: 1 },
  { id: 'earth-rooted', word: 'Rooted', quote: 'Deep roots weather every storm that passes overhead.', element: 'earth', svgPath: 'earth/rooted.svg', order: 2 },
  { id: 'earth-patience', word: 'Patience', quote: 'Growth happens in the quiet spaces between effort and surrender.', element: 'earth', svgPath: 'earth/patience.svg', order: 3 },
  { id: 'earth-harvest', word: 'Harvest', quote: 'Honor the fruits of your labor and the seasons that shaped them.', element: 'earth', svgPath: 'earth/harvest.svg', order: 4 },
  { id: 'earth-sanctuary', word: 'Sanctuary', quote: 'Build a refuge within yourself that no outside force can shake.', element: 'earth', svgPath: 'earth/sanctuary.svg', order: 5 },
  { id: 'earth-foundation', word: 'Foundation', quote: 'Every great creation begins with a single, steady step.', element: 'earth', svgPath: 'earth/foundation.svg', order: 6 },
  { id: 'earth-stillness', word: 'Stillness', quote: 'In stillness, the world reveals what noise has hidden.', element: 'earth', svgPath: 'earth/stillness.svg', order: 7 },
  { id: 'earth-resilience', word: 'Resilience', quote: 'The mountain does not move for the wind; it stands and endures.', element: 'earth', svgPath: 'earth/resilience.svg', order: 8 },
  { id: 'earth-nourish', word: 'Nourish', quote: 'Tend to yourself with the same care you give to those you love.', element: 'earth', svgPath: 'earth/nourish.svg', order: 9 },
  { id: 'earth-balance', word: 'Balance', quote: 'Find the steady center between doing and simply being.', element: 'earth', svgPath: 'earth/balance.svg', order: 10 },

  // --- FIRE (10 cards) ---
  { id: 'fire-passion', word: 'Passion', quote: 'Let your inner flame illuminate the path forward.', element: 'fire', svgPath: 'fire/passion.svg', order: 1 },
  { id: 'fire-courage', word: 'Courage', quote: 'Step toward what frightens you; that is where your power waits.', element: 'fire', svgPath: 'fire/courage.svg', order: 2 },
  { id: 'fire-transformation', word: 'Transformation', quote: 'From the ashes of the old, something luminous is born.', element: 'fire', svgPath: 'fire/transformation.svg', order: 3 },
  { id: 'fire-spark', word: 'Spark', quote: 'One small idea can ignite a revolution within.', element: 'fire', svgPath: 'fire/spark.svg', order: 4 },
  { id: 'fire-radiance', word: 'Radiance', quote: 'Shine without apology; the world needs your particular light.', element: 'fire', svgPath: 'fire/radiance.svg', order: 5 },
  { id: 'fire-release', word: 'Release', quote: 'Let the fire burn away what no longer serves your spirit.', element: 'fire', svgPath: 'fire/release.svg', order: 6 },
  { id: 'fire-desire', word: 'Desire', quote: 'Your longing is a compass pointing toward your truest self.', element: 'fire', svgPath: 'fire/desire.svg', order: 7 },
  { id: 'fire-willpower', word: 'Willpower', quote: 'The forge of determination shapes raw intention into reality.', element: 'fire', svgPath: 'fire/willpower.svg', order: 8 },
  { id: 'fire-rebirth', word: 'Rebirth', quote: 'Every ending carries the seed of a new beginning within it.', element: 'fire', svgPath: 'fire/rebirth.svg', order: 9 },
  { id: 'fire-intensity', word: 'Intensity', quote: 'Feel everything fully; half-lived moments leave half-filled hearts.', element: 'fire', svgPath: 'fire/intensity.svg', order: 10 },

  // --- WATER (10 cards) ---
  { id: 'water-flow', word: 'Flow', quote: 'Surrender to the current and trust where it carries you.', element: 'water', svgPath: 'water/flow.svg', order: 1 },
  { id: 'water-depth', word: 'Depth', quote: 'Dive beneath the surface to find what truly matters.', element: 'water', svgPath: 'water/depth.svg', order: 2 },
  { id: 'water-intuition', word: 'Intuition', quote: 'Your inner knowing speaks in whispers; learn to listen closely.', element: 'water', svgPath: 'water/intuition.svg', order: 3 },
  { id: 'water-reflection', word: 'Reflection', quote: 'Still waters mirror the truth that motion obscures.', element: 'water', svgPath: 'water/reflection.svg', order: 4 },
  { id: 'water-healing', word: 'Healing', quote: 'Like water smoothing stone, time and tenderness mend all wounds.', element: 'water', svgPath: 'water/healing.svg', order: 5 },
  { id: 'water-empathy', word: 'Empathy', quote: 'When you hold space for another, two hearts find rest.', element: 'water', svgPath: 'water/empathy.svg', order: 6 },
  { id: 'water-adaptability', word: 'Adaptability', quote: 'Water shapes itself to every vessel yet loses nothing of itself.', element: 'water', svgPath: 'water/adaptability.svg', order: 7 },
  { id: 'water-cleanse', word: 'Cleanse', quote: 'Release what clouds your clarity and let fresh currents in.', element: 'water', svgPath: 'water/cleanse.svg', order: 8 },
  { id: 'water-dreams', word: 'Dreams', quote: 'The ocean of your subconscious holds treasures yet undiscovered.', element: 'water', svgPath: 'water/dreams.svg', order: 9 },
  { id: 'water-serenity', word: 'Serenity', quote: 'Peace is not the absence of storms but the calm within them.', element: 'water', svgPath: 'water/serenity.svg', order: 10 },

  // --- AIR (10 cards) ---
  { id: 'air-clarity', word: 'Clarity', quote: 'Clear your mind and the answers will find their way to you.', element: 'air', svgPath: 'air/clarity.svg', order: 1 },
  { id: 'air-freedom', word: 'Freedom', quote: 'Untether yourself from expectations and discover your own sky.', element: 'air', svgPath: 'air/freedom.svg', order: 2 },
  { id: 'air-breath', word: 'Breath', quote: 'Each breath is an invitation to begin again, right now.', element: 'air', svgPath: 'air/breath.svg', order: 3 },
  { id: 'air-perspective', word: 'Perspective', quote: 'Rise above the details to see the larger pattern at work.', element: 'air', svgPath: 'air/perspective.svg', order: 4 },
  { id: 'air-communication', word: 'Communication', quote: 'Speak your truth gently; authentic words carry the farthest.', element: 'air', svgPath: 'air/communication.svg', order: 5 },
  { id: 'air-inspiration', word: 'Inspiration', quote: 'Open yourself to the invisible currents that carry new ideas.', element: 'air', svgPath: 'air/inspiration.svg', order: 6 },
  { id: 'air-lightness', word: 'Lightness', quote: 'Set down the weight of worry and feel how far you can soar.', element: 'air', svgPath: 'air/lightness.svg', order: 7 },
  { id: 'air-mindfulness', word: 'Mindfulness', quote: 'Observe your thoughts like clouds passing through a vast sky.', element: 'air', svgPath: 'air/mindfulness.svg', order: 8 },
  { id: 'air-detachment', word: 'Detachment', quote: 'Letting go is not losing; it is making room for what is next.', element: 'air', svgPath: 'air/detachment.svg', order: 9 },
  { id: 'air-wonder', word: 'Wonder', quote: 'Approach each moment as if seeing the world for the first time.', element: 'air', svgPath: 'air/wonder.svg', order: 10 },
];

export const getCardsByElement = (element: Element): OracleCard[] =>
  cards.filter(c => c.element === element);

export const getRandomCard = (
  filter: ElementFilter = 'all',
  exclude: string[] = []
): OracleCard | null => {
  const pool = filter === 'all'
    ? cards.filter(c => !exclude.includes(c.id))
    : cards.filter(c => c.element === filter && !exclude.includes(c.id));

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

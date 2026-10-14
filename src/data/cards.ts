import type { OracleCard, Element, ElementFilter } from '../types/card';

export const cards: OracleCard[] = [
  // --- EARTH ---
  { id: 'earth-grounded', word: 'Grounded', quote: 'Come down from there, your tea’s going cold.', element: 'earth', svgPath: 'v2/earth/grounded.webp', order: 1 },
  { id: 'earth-passage', word: 'Passage', quote: 'Don’t know where you’re going? Nobody does, honestly. Nice hat though, keep walking.', element: 'earth', svgPath: 'v2/earth/passage.webp', order: 2 },
  { id: 'earth-spine', word: 'Spine', quote: 'Unclench your jaw. Shoulders too. Yes, I can see you from here.', element: 'earth', svgPath: 'v2/earth/spine.webp', order: 3 },
  { id: 'earth-foundation', word: 'Foundation', quote: 'The dull bit you keep skipping? Yeah, that’s the bit holding everything up. Sorry.', element: 'earth', svgPath: 'v2/earth/foundation.webp', order: 4 },
  { id: 'earth-craft', word: 'Craft', quote: 'You’re going to make a lot of ugly pots first. Everybody did. Mine were hideous.', element: 'earth', svgPath: 'v2/earth/craft.webp', order: 5 },
  { id: 'earth-burial', word: 'Burial', quote: 'Oh love, that project’s dead. Has been since March. Say something nice and let’s go get a drink.', element: 'earth', svgPath: 'v2/earth/burial.webp', order: 6 },
  { id: 'earth-sanctuary', word: 'Sanctuary', quote: 'You’re a small dragon, that desk is your hoard, and the door has a lock for a reason.', element: 'earth', svgPath: 'v2/earth/sanctuary.webp', order: 7 },
  { id: 'earth-patience', word: 'Patience', quote: 'It’ll get here when it gets here, which I’m told is exactly what the skeleton at the bus stop said.', element: 'earth', svgPath: 'v2/earth/patience.webp', order: 8 },
  { id: 'earth-rest', word: 'Rest', quote: 'Go to bed, you ridiculous creature.', element: 'earth', svgPath: 'v2/earth/rest.webp', order: 9 },
  { id: 'earth-routine', word: 'Routine', quote: 'Same desk, same hour, same sad little tea, every day, until one morning something good is just sitting there like it was always going to be.', element: 'earth', svgPath: 'v2/earth/routine.webp', order: 10 },
  { id: 'earth-harvest', word: 'Harvest', quote: 'I’ll make you a deal: finish one thing, any thing, the smallest thing, and I’ll stop bringing up the other eight.', element: 'earth', svgPath: 'v2/earth/harvest.webp', order: 11 },
  { id: 'earth-compost', word: 'Compost', quote: 'Somewhere under last year’s worst drawing, next year’s best one is having a lovely time in the muck.', element: 'earth', svgPath: 'v2/earth/compost.webp', order: 12 },
  { id: 'earth-price', word: 'Price', quote: 'Nobody ever had “very reasonably priced” carved on their headstone.', element: 'earth', svgPath: 'v2/earth/price.webp', order: 13 },

  // --- FIRE ---
  { id: 'fire-passion', word: 'Passion', quote: 'Careful, that thing you love is going to cost you money, sleep and at least one relationship. Worth it? Probably. Hold on tight.', element: 'fire', svgPath: 'v2/fire/passion.webp', order: 1 },
  { id: 'fire-spark', word: 'Spark', quote: 'Write it down now. You think you’ll remember. You won’t, you never do, that’s how we lost the last one.', element: 'fire', svgPath: 'v2/fire/spark.webp', order: 2 },
  { id: 'fire-courage', word: 'Courage', quote: 'Just post it. Most people are too busy wondering if their own thing is stupid.', element: 'fire', svgPath: 'v2/fire/courage.webp', order: 3 },
  { id: 'fire-envy', word: 'Envy', quote: 'Go on, be jealous for a minute, I won’t tell. Now, what exactly did they do that you fancy doing?', element: 'fire', svgPath: 'v2/fire/envy.webp', order: 4 },
  { id: 'fire-ambition', word: 'Ambition', quote: 'Go for the ridiculous one. Worst case you fall in the sea, and you can swim, can’t you? ...Can’t you?', element: 'fire', svgPath: 'v2/fire/ambition.webp', order: 5 },
  { id: 'fire-desire', word: 'Desire', quote: 'You want it, it’s written all over your face. Stop acting cool, cool never got anybody anything.', element: 'fire', svgPath: 'v2/fire/desire.webp', order: 6 },
  { id: 'fire-rejection', word: 'Rejection', quote: 'They said no. Rude. Stick it on the pile with the others and send the next one before lunch.', element: 'fire', svgPath: 'v2/fire/rejection.webp', order: 7 },
  { id: 'fire-audacity', word: 'Audacity', quote: 'Somebody far less good than you applied for it this morning without blinking. Just so you know.', element: 'fire', svgPath: 'v2/fire/audacity.webp', order: 8 },
  { id: 'fire-momentum', word: 'Momentum', quote: 'Keep going. It’s ugly, but it’s got legs.', element: 'fire', svgPath: 'v2/fire/momentum.webp', order: 9 },
  { id: 'fire-deadline', word: 'Deadline', quote: 'Thank god for Friday, or you’d never finish anything in your life.', element: 'fire', svgPath: 'v2/fire/deadline.webp', order: 10 },
  { id: 'fire-burnout', word: 'Burnout', quote: 'You smell a bit like toast, my friend, and I say this with love: stop.', element: 'fire', svgPath: 'v2/fire/burnout.webp', order: 11 },
  { id: 'fire-ego', word: 'Ego', quote: 'Yes, yes, a genius, we’ve all heard, now would the genius like to open the file?', element: 'fire', svgPath: 'v2/fire/ego.webp', order: 12 },
  { id: 'fire-rage', word: 'Rage', quote: 'Furious? Oh good. Bring that over here and point it at something.', element: 'fire', svgPath: 'v2/fire/rage.webp', order: 13 },

  // --- WATER ---
  { id: 'water-flow', word: 'Flow', quote: 'Shh. It’s working. Don’t look at it directly, don’t tell anyone, and do not check your phone.', element: 'water', svgPath: 'v2/water/flow.webp', order: 1 },
  { id: 'water-intuition', word: 'Intuition', quote: 'You already know which one. You’re only asking me so you’ve got someone to blame.', element: 'water', svgPath: 'v2/water/intuition.webp', order: 2 },
  { id: 'water-drift', word: 'Drift', quote: 'Nothing’s happening this week? Fine. Be a jellyfish. No bones, no plans, lovely.', element: 'water', svgPath: 'v2/water/drift.webp', order: 3 },
  { id: 'water-block', word: 'Block', quote: 'You keep dropping the same bucket down the same well. Have you tried, I don’t know, a different well?', element: 'water', svgPath: 'v2/water/block.webp', order: 4 },
  { id: 'water-feedback', word: 'Feedback', quote: 'Some of that was true and you hate it. Fine. Kick something soft, then go and fix the true part.', element: 'water', svgPath: 'v2/water/feedback.webp', order: 5 },
  { id: 'water-tears', word: 'Tears', quote: 'A little cry in the loo and then back to it, like a professional.', element: 'water', svgPath: 'v2/water/tears.webp', order: 6 },
  { id: 'water-comparison', word: 'Comparison', quote: 'You’re comparing your Tuesday to their best day of the year again, aren’t you.', element: 'water', svgPath: 'v2/water/comparison.webp', order: 7 },
  { id: 'water-overflow', word: 'Overflow', quote: 'Crying over a typeface isn’t too much. It’s the right amount, and it’s why I’d hire you.', element: 'water', svgPath: 'v2/water/overflow.webp', order: 8 },
  { id: 'water-doubt', word: 'Doubt', quote: 'Funny how the actual frauds never lie awake wondering.', element: 'water', svgPath: 'v2/water/doubt.webp', order: 9 },
  { id: 'water-compassion', word: 'Compassion', quote: 'Oi. That’s my friend you’re talking to.', element: 'water', svgPath: 'v2/water/compassion.webp', order: 10 },
  { id: 'water-dreams', word: 'Dreams', quote: 'Pen by the bed tonight; your sleeping brain is a weirdo and I want to know what it’s up to.', element: 'water', svgPath: 'v2/water/dreams.webp', order: 11 },
  { id: 'water-empathy', word: 'Empathy', quote: 'Who’s it for? (If you say “everyone” I’m leaving.)', element: 'water', svgPath: 'v2/water/empathy.webp', order: 12 },
  { id: 'water-help', word: 'Help', quote: 'You’d rather drown than wave, wouldn’t you. Wave, you idiot.', element: 'water', svgPath: 'v2/water/help.webp', order: 13 },

  // --- AIR ---
  { id: 'air-breathe', word: 'Breathe', quote: 'Big breath in. Bigger one out. See, nothing’s on fire. Well, nothing important.', element: 'air', svgPath: 'v2/air/breathe.webp', order: 1 },
  { id: 'air-clarity', word: 'Clarity', quote: 'What is it? No, what is it really. Yes, that.', element: 'air', svgPath: 'v2/air/clarity.webp', order: 2 },
  { id: 'air-overthinking', word: 'Overthinking', quote: 'You’ve planned it beautifully. Shall we try doing it, as a treat?', element: 'air', svgPath: 'v2/air/overthinking.webp', order: 3 },
  { id: 'air-wonder', word: 'Wonder', quote: 'When did something last make you go “huh”? Go and find another one of those.', element: 'air', svgPath: 'v2/air/wonder.webp', order: 4 },
  { id: 'air-perspective', word: 'Perspective', quote: 'From the moon nobody can tell the logo’s two pixels off, which is a great comfort and absolutely no excuse.', element: 'air', svgPath: 'v2/air/perspective.webp', order: 5 },
  { id: 'air-distraction', word: 'Distraction', quote: 'Forty tabs, and which one did you come in for?', element: 'air', svgPath: 'v2/air/distraction.webp', order: 6 },
  { id: 'air-lightness', word: 'Lightness', quote: 'What’s the silliest version of this? Make that one, just to see my face.', element: 'air', svgPath: 'v2/air/lightness.webp', order: 7 },
  { id: 'air-silence', word: 'Silence', quote: 'You could just... not post that one.', element: 'air', svgPath: 'v2/air/silence.webp', order: 8 },
  { id: 'air-voice', word: 'Voice', quote: 'The line you nearly deleted is the one I wanted.', element: 'air', svgPath: 'v2/air/voice.webp', order: 9 },
  { id: 'air-detachment', word: 'Detachment', quote: 'It’s out, it’s theirs now, wave nicely and do not, I’m begging you, read the comments.', element: 'air', svgPath: 'v2/air/detachment.webp', order: 10 },
  { id: 'air-theft', word: 'Theft', quote: 'Steal from one person and you’re a thief; steal from forty and you’ve got a style. Say thank you either way.', element: 'air', svgPath: 'v2/air/theft.webp', order: 11 },
  { id: 'air-jargon', word: 'Jargon', quote: 'Read your artist statement to your nan and watch her face.', element: 'air', svgPath: 'v2/air/jargon.webp', order: 12 },
  { id: 'air-witness', word: 'Witness', quote: 'Let the mean friend see it first. If it survives her, it survives anything.', element: 'air', svgPath: 'v2/air/witness.webp', order: 13 },
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

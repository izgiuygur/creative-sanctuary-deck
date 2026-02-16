import gsap from 'gsap';

export interface AnimationRefs {
  deckStack: HTMLDivElement;
  cardContainer: HTMLDivElement;
  cardInner: HTMLDivElement;
}

export function createDrawTimeline(
  refs: AnimationRefs,
  onMidFlip: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Phase 1: Lift from deck
  tl.fromTo(
    refs.cardContainer,
    { y: 0, scale: 1, opacity: 0 },
    { y: -80, scale: 1.05, opacity: 1, duration: 0.4, ease: 'power2.out' },
    0
  );

  // Fade deck
  tl.to(
    refs.deckStack,
    { opacity: 0.3, scale: 0.95, duration: 0.3, ease: 'power2.out' },
    0
  );

  // Phase 2: Flip first half (0 -> 90deg)
  tl.to(
    refs.cardInner,
    { rotateY: 90, duration: 0.3, ease: 'power2.in' },
    0.5
  );

  // Swap faces at midpoint
  tl.call(onMidFlip, [], 0.8);

  // Flip second half (90 -> 180deg)
  tl.to(
    refs.cardInner,
    { rotateY: 180, duration: 0.3, ease: 'power2.out' },
    0.8
  );

  // Phase 3: Settle
  tl.to(
    refs.cardContainer,
    { y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' },
    1.1
  );

  return tl;
}

export function createSaveTimeline(
  refs: AnimationRefs
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Shrink and fly toward the right sidebar (no flip — stays face-up)
  tl.to(refs.cardContainer, {
    x: 300,
    y: -20,
    scale: 0.3,
    opacity: 0,
    duration: 0.5,
    ease: 'power3.in',
  });

  // Restore deck
  tl.to(
    refs.deckStack,
    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
    '-=0.25'
  );

  return tl;
}

export function createReturnTimeline(
  refs: AnimationRefs,
  onMidFlip: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Lift
  tl.to(refs.cardContainer, {
    y: -40,
    scale: 0.95,
    duration: 0.25,
    ease: 'power2.in',
  });

  // Flip back first half
  tl.to(refs.cardInner, {
    rotateY: 90,
    duration: 0.2,
    ease: 'power2.in',
  });

  tl.call(onMidFlip, []);

  // Flip back second half
  tl.to(refs.cardInner, {
    rotateY: 0,
    duration: 0.2,
    ease: 'power2.out',
  });

  // Settle into deck
  tl.to(refs.cardContainer, {
    y: 0,
    scale: 1,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  });

  // Restore deck
  tl.to(
    refs.deckStack,
    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
    '-=0.2'
  );

  return tl;
}

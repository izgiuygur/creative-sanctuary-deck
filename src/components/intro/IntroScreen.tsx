import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface IntroScreenProps {
  onComplete: () => void;
}

type IntroStage = 'breathing' | 'orb-reveal' | 'ready';

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [stage, setStage] = useState<IntroStage>('breathing');

  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Stage 1: Breathing exercise
  useEffect(() => {
    if (stage !== 'breathing') return;

    const glow = glowRef.current;
    const text = textRef.current;
    if (!glow || !text) return;

    let cancelled = false;
    let cycle = 0;
    const totalCycles = 2;

    // Initialize glow state
    gsap.set(glow, { opacity: 0.3, scale: 0.8 });

    function inhale() {
      if (cancelled) return;
      text.textContent = 'Breathe in...';
      gsap.to(glow, {
        opacity: 1, scale: 1.4, duration: 4, ease: 'sine.inOut',
        onComplete: () => { if (!cancelled) exhale(); },
      });
    }

    function exhale() {
      if (cancelled) return;
      text.textContent = 'Breathe out...';
      gsap.to(glow, {
        opacity: 0.3, scale: 0.8, duration: 2, ease: 'sine.inOut',
        onComplete: () => {
          if (cancelled) return;
          cycle++;
          if (cycle < totalCycles) {
            inhale();
          } else {
            setStage('orb-reveal');
          }
        },
      });
    }

    inhale();

    return () => {
      cancelled = true;
    };
  }, [stage]);

  // Stage 2: Orb reveal — title + CTA fade in
  useEffect(() => {
    if (stage !== 'orb-reveal') return;

    const orb = orbRef.current;
    const glow = glowRef.current;
    const title = titleRef.current;
    const cta = ctaRef.current;
    const text = textRef.current;
    if (!orb || !glow || !title || !cta || !text) {
      setStage('ready');
      return;
    }

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => setStage('ready'),
    });

    // Fade out breathing text
    tl.to(text, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0);

    // Glow settles to steady state
    tl.to(glow, {
      opacity: 0.7,
      scale: 1,
      duration: 1,
      ease: 'power2.out',
    }, 0.3);

    // Title fades in from above
    tl.fromTo(title,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      0.5
    );

    // CTA fades in from below
    tl.fromTo(cta,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      0.8
    );

    timelineRef.current = tl;
    tl.play();

    return () => { tl.kill(); };
  }, [stage]);

  // Handle exit transition
  const handleStart = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      onComplete();
      return;
    }

    timelineRef.current?.kill();

    const tl = gsap.timeline({ paused: true });

    // Orb and glow dissolve
    const orb = orbRef.current;
    const glow = glowRef.current;
    if (orb) {
      tl.to(orb, { opacity: 0, duration: 0.8, ease: 'power2.in' }, 0);
    }
    if (glow) {
      tl.to(glow, { opacity: 0, scale: 1.5, duration: 0.8, ease: 'power2.in' }, 0);
    }

    // All text fades
    tl.to(
      [titleRef.current, textRef.current, ctaRef.current].filter(Boolean),
      { opacity: 0, duration: 0.4, ease: 'power2.in' },
      0
    );

    // Container fades out
    tl.to(container, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
    }, 0.3);

    tl.eventCallback('onComplete', () => onComplete());
    tl.play();
  }, [onComplete]);

  return (
    <div className="intro-screen" ref={containerRef}>
      <h1 className="intro-screen__title" ref={titleRef}>
        Creative's<br />Sanctuary
      </h1>

      <div className="intro-screen__orb-wrapper">
        <div className="intro-screen__glow" ref={glowRef} />
        <div className="intro-screen__orb" ref={orbRef} />
      </div>

      <p className="intro-screen__breath-text" ref={textRef}>
        Breathe in...
      </p>

      <button
        className="intro-screen__cta"
        ref={ctaRef}
        onClick={handleStart}
      >
        Let's start shuffling
      </button>

      <button
        className="intro-screen__skip"
        onClick={handleStart}
      >
        Skip
      </button>
    </div>
  );
}

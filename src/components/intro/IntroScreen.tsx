import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface IntroScreenProps {
  /** Called when the breathing ends; `skipped` is true when the visitor skipped it. */
  onComplete: (skipped?: boolean) => void;
}

const IN = 4;
const OUT = 6;
const CYCLES = 2;
const C = 260;
const RAY_PUSH = 22;

const RAYS = Array.from({ length: 16 }, (_, k) => {
  const a = ((k * 22.5 - 90) * Math.PI) / 180;
  const r1 = 206;
  const r2 = k % 2 === 0 ? 236 : 224;
  return {
    x1: C + r1 * Math.cos(a),
    y1: C + r1 * Math.sin(a),
    x2: C + r2 * Math.cos(a),
    y2: C + r2 * Math.sin(a),
    dx: Math.cos(a) * RAY_PUSH,
    dy: Math.sin(a) * RAY_PUSH,
  };
});

const PHRASES = ['Breathe in.', 'And out.', 'There. Better.', 'Right. Let’s see what you get.'];
const [BREATHE_IN, AND_OUT, BETTER, HANDOFF] = [0, 1, 2, 3];

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // On a phone the sun is small, so the breath needs to be bigger to read as one.
    const phone = window.matchMedia('(max-width: 760px)').matches;
    const ringGrow = phone ? 1.38 : 1.17;
    const rayPush = phone ? 2.4 : 1;

    const ctx = gsap.context(() => {
      const phrases = gsap.utils.toArray<HTMLElement>('.intro__line span');
      const rays = gsap.utils.toArray<SVGLineElement>('.intro__rays line');
      const say = (tl: gsap.core.Timeline, which: number, at: number) =>
        tl
          .to(phrases, { opacity: 0, y: 6, duration: 0.35, ease: 'power1.in' }, at)
          .fromTo(phrases[which], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out', immediateRender: false }, at + 0.36);

      // svgOrigin is in the SVG's own coordinates, so these scale and turn about the sun's exact centre.
      gsap.set(['.intro__body', '.intro__ring'], { svgOrigin: '260 260' });
      gsap.set(phrases, { opacity: 0 });
      gsap.set(phrases[BREATHE_IN], { opacity: 1 });

      const tl = gsap.timeline({ onComplete: () => doneRef.current() });
      tlRef.current = tl;
      tl.from('.intro__sun', { opacity: 0, scale: 0.92, transformOrigin: '50% 50%', duration: 1, ease: 'power2.out' });

      for (let i = 0; i < CYCLES; i++) {
        const t0 = 1 + i * (IN + OUT);
        if (i > 0) say(tl, BREATHE_IN, t0 - 0.4);
        // The disc and face hold still; the ring widens and the rays stretch out in turn.
        if (!reduce) {
          tl.to('.intro__ring', { scale: ringGrow, opacity: 0.6, duration: IN, ease: 'sine.inOut' }, t0).to(
            rays,
            { x: i2 => RAYS[i2].dx * rayPush, y: i2 => RAYS[i2].dy * rayPush, duration: IN * 0.7, ease: 'sine.inOut', stagger: { each: 0.07, from: 0 } },
            t0
          );
        }
        say(tl, AND_OUT, t0 + IN - 0.4);
        if (!reduce) {
          tl.to('.intro__ring', { scale: 1, opacity: 1, duration: OUT, ease: 'sine.inOut' }, t0 + IN).to(
            rays,
            { x: 0, y: 0, duration: OUT * 0.75, ease: 'sine.inOut', stagger: { each: 0.07, from: 'end' } },
            t0 + IN
          );
        }
      }

      const end = 1 + CYCLES * (IN + OUT);
      tl.addLabel('wake', end - 0.4);
      say(tl, BETTER, end - 0.4);
      tl.to('.intro__eyes-closed', { opacity: 0, duration: 0.15 }, end + 0.2)
        .fromTo('.intro__eyes-open', { opacity: 0, scale: 0.4, svgOrigin: '260 246' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, end + 0.25)
        .to('.intro__body', { rotation: 5, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 3 }, end + 0.6)
        .to('.intro__sub', { opacity: 0, duration: 0.4 }, end + 0.6);
      say(tl, HANDOFF, end + 2.2);
      tl.to('.intro__sun', { y: '-70vh', opacity: 0, duration: 1.1, ease: 'power2.in' }, end + 3.6).to(root, { opacity: 0, duration: 0.45 }, end + 4.5);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro__wordmark">Creative’s Sanctuary</div>

      <svg className="intro__sun" viewBox="0 0 520 520" fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <g className="intro__rays">
          {RAYS.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
        <circle className="intro__ring" cx="260" cy="260" r="186" strokeDasharray="3 12" />
        <g className="intro__body" style={{ stroke: 'var(--on-sun)' }}>
          <circle cx="260" cy="260" r="150" fill="#F6EC5E" />
          <circle cx="186" cy="282" r="12" strokeDasharray="2 6" />
          <circle cx="334" cy="282" r="12" strokeDasharray="2 6" />
          <g className="intro__eyes-closed">
            <path d="M196 244 C206 256 224 256 234 244" />
            <path d="M286 244 C296 256 314 256 324 244" />
          </g>
          <g className="intro__eyes-open" opacity="0">
            <circle cx="215" cy="246" r="7" style={{ fill: 'var(--on-sun)' }} stroke="none" />
            <circle cx="305" cy="246" r="7" style={{ fill: 'var(--on-sun)' }} stroke="none" />
          </g>
          <path d="M252 262 C248 274 252 282 262 282" />
          <path d="M238 300 C250 312 270 312 282 300" />
        </g>
      </svg>

      <div className="intro__line">
        {PHRASES.map(p => (
          <span key={p}>{p}</span>
        ))}
      </div>
      <div className="intro__sub eyebrow">In for four · out for six</div>

      <button type="button" className="intro__skip textlink" onClick={() => {
          // Straight to the deck: no closing lines.
          tlRef.current?.kill();
          doneRef.current(true);
        }}>
        Skip the breathing
      </button>
    </div>
  );
}

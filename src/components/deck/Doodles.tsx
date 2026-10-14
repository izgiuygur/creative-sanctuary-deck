const SPARK = 'M30 2 C32 20 40 28 58 30 C40 32 32 40 30 58 C28 40 20 32 2 30 C20 28 28 20 30 2 Z';

function Spark({ className, solid }: { className: string; solid?: boolean }) {
  return (
    <svg aria-hidden="true" className={`doodle ${className}`} viewBox="0 0 60 60" fill={solid ? 'currentColor' : 'none'} stroke={solid ? 'none' : 'currentColor'} strokeWidth="3.2" strokeLinejoin="round">
      <path d={SPARK} />
    </svg>
  );
}

/** Scattered drawings for the resting screen. Decorative, except the eye (it brings the breathing back) and the moon (it turns the lights off). */
export default function Doodles({ onBreathe, dark, onLights }: { onBreathe: () => void; dark: boolean; onLights: () => void }) {
  return (
    <div className="doodles">
      <button type="button" className="doodle doodle--moon lights" onClick={onLights} aria-pressed={dark} aria-label="Dark mode">
        <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
          <path d="M40 4 C18 8 6 26 12 44 C18 60 38 66 54 56 C34 56 22 36 40 4 Z" />
        </svg>
        <span className="lights__label" aria-hidden="true">{dark ? 'Lights on' : 'Lights off'}</span>
      </button>
      <Spark className="doodle--spark-a" solid />
      <Spark className="doodle--spark-b doodle--wide" solid />
      <Spark className="doodle--spark-c" />
      <Spark className="doodle--spark-d doodle--wide" solid />
      <Spark className="doodle--spark-e doodle--wide" />
      <svg aria-hidden="true" className="doodle doodle--beads doodle--wide" viewBox="0 0 200 90" fill="none" stroke="currentColor" strokeWidth="2">
        {[[10, 20], [28, 32], [48, 40], [69, 43], [90, 42], [110, 38], [130, 34], [150, 36], [168, 46], [182, 62]].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="5" />
        ))}
      </svg>
      <svg aria-hidden="true" className="doodle doodle--star" viewBox="0 0 150 150" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M75 6 L86 48 L122 22 L102 62 L144 68 L104 84 L130 120 L90 104 L80 144 L66 104 L28 126 L48 88 L6 78 L46 64 L22 28 L62 48 Z" />
      </svg>
      <svg aria-hidden="true" className="doodle doodle--jellyfish doodle--wide" viewBox="0 0 300 400" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M62 170 C56 108 104 60 160 64 C216 68 252 114 244 168 C232 160 222 178 208 170 C196 163 186 182 172 174 C160 167 148 185 134 176 C122 169 110 187 96 178 C84 171 72 181 62 170 Z" />
        <path d="M96 128 C102 112 112 100 126 92" />
        <path d="M118 146 C140 134 178 134 198 146" strokeDasharray="5 9" />
        <path d="M96 180 C80 220 112 250 92 292 C84 310 70 322 62 342" />
        <path d="M134 178 C120 230 160 262 138 318 C132 336 120 350 116 374 C134 358 152 342 156 314 C168 262 138 232 150 178" />
        <path d="M172 176 C188 220 160 252 180 300 C188 322 202 332 204 358" />
        <path d="M196 172 C212 214 188 242 204 284 C210 302 228 312 244 322 C240 304 232 294 224 280 C204 240 228 212 210 172" />
      </svg>
      <svg aria-hidden="true" className="doodle doodle--gate doodle--wide" viewBox="0 0 300 400" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36 118 C80 132 220 132 266 114 C266 122 264 130 260 136 C216 152 84 152 42 140 C38 132 36 126 36 118 Z" />
        <path d="M66 186 C110 190 190 190 236 185 L237 200 C190 205 110 205 65 201 Z" />
        <path d="M88 146 C90 160 89 172 88 186 M104 148 C105 162 104 174 104 187 M87 202 C86 260 82 320 78 372 M103 203 C102 262 100 322 98 372" />
        <path d="M214 147 C213 162 214 174 214 187 M198 148 C198 162 198 174 199 188 M215 202 C217 262 220 322 224 372 M199 203 C200 262 201 322 203 372" />
        <path d="M41 376C41 361 46 352 48 346 M45 376C45 353 46 340 48 331 M149 376C148 363 147 354 143 349 M153 376C154 349 157 333 162 322 M255 376C256 348 262 331 266 320 M259 376C260 360 262 351 266 345" />
      </svg>
      <svg aria-hidden="true" className="doodle doodle--zigzag doodle--wide" viewBox="0 0 130 50" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38 L32 12 L56 38 L80 12 L104 38 L122 18" />
      </svg>
      <svg aria-hidden="true" className="doodle doodle--squiggle" viewBox="0 0 150 60" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <path d="M8 40 C24 4 44 4 56 30 C68 56 88 56 100 30 C110 8 128 8 142 26" />
      </svg>
      <button type="button" className="doodle doodle--eye breathe" onClick={onBreathe} aria-label="Breathe with the sun">
        <svg viewBox="0 0 96 56" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 28 C24 4 72 4 92 28 C72 52 24 52 4 28 Z" />
          <circle cx="48" cy="28" r="12" />
          <circle cx="48" cy="28" r="4" fill="currentColor" />
        </svg>
        <span className="breathe__label" aria-hidden="true">Breathe</span>
      </button>
    </div>
  );
}

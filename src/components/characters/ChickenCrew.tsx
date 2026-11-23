import type { ReactionState } from '../../game/types';

interface ChickenProps {
  reaction?: ReactionState;
  battleMode?: boolean;
  flexing?: boolean;
  size?: number;
}

interface RaccoonProps {
  panicked?: boolean;
  size?: number;
}

const INK = '#281a38';

/** Plump White Hero Chicken — flips into fierce Red Karate-Headband mode vs Raccoon! */
export function HeroChickenSvg({
  reaction = 'idle',
  battleMode = false,
  flexing = false,
  size = 146,
}: ChickenProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate' || flexing;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 170 165"
      fill="none"
      aria-label="Hero White Chicken"
    >
      <ellipse cx="85" cy="154" rx="40" ry="8" fill="rgba(40,26,56,0.18)" />

      {/* Orange Chicken Feet */}
      <path
        d="M68 134 L64 150 M64 150 L54 153 M64 150 L64 156 M64 150 L73 153"
        stroke="#f97316"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M100 134 L104 150 M104 150 L95 153 M104 150 L104 156 M104 150 L114 153"
        stroke="#f97316"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Tail feathers */}
      <path
        d="M42 104 Q16 86 24 72 Q36 74 42 86 Q28 66 38 58 Q50 66 54 84"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Plump Body */}
      <ellipse cx="86" cy="96" rx="44" ry="42" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
      <ellipse cx="86" cy="108" rx="34" ry="24" fill="#f8fafc" />

      {/* Big Bright Red Comb */}
      <path
        d="M66 56 C62 34 80 30 84 46 C90 26 108 32 104 50 C114 38 124 50 112 60 Z"
        fill="#ef4444"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Fierce Red Karate Headband (shown in Battle Mode or Victory Flex!) */}
      {(battleMode || flexing) && (
        <g>
          <path
            d="M46 66 Q88 54 126 66 L124 76 Q88 65 48 76 Z"
            fill="#dc2626"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Flowing headband tails */}
          <path
            d="M48 70 Q24 62 12 72 Q26 78 46 75 Z"
            fill="#ef4444"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M48 74 Q26 80 18 92 Q34 90 48 78 Z"
            fill="#dc2626"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Left Wing */}
      <g className="svg-wing-left">
        <path
          d="M48 94 Q22 86 24 106 Q30 120 52 114 Z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Right Wing (Flexing superhero bicep in victory, or fiercely flapping!) */}
      {flexing ? (
        <path
          d="M122 96 Q146 96 146 72 Q146 60 134 62 Q128 66 132 76 Q128 84 118 88 Z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      ) : (
        <g className="svg-wing-right">
          <path
            d="M124 94 Q154 78 152 102 Q144 118 120 112 Z"
            fill="#ffffff"
            stroke={INK}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Eyes */}
      {battleMode ? (
        <>
          <circle cx="75" cy="80" r="7.5" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <circle cx="77" cy="80" r="3.5" fill={INK} />
          <circle cx="105" cy="80" r="7.5" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <circle cx="107" cy="80" r="3.5" fill={INK} />
          {/* Fierce V-shaped cartoon eyebrows */}
          <path d="M64 69 L84 77" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M116 69 L96 77" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : isHappy ? (
        <>
          <path d="M68 80 Q75 72 82 80" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M98 80 Q105 72 112 80" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="75" cy="80" r="6" fill={INK} />
          <circle cx="77" cy="78" r="2.2" fill="#ffffff" />
          <circle cx="105" cy="80" r="6" fill={INK} />
          <circle cx="107" cy="78" r="2.2" fill="#ffffff" />
        </g>
      )}

      {/* Cheeks */}
      {!battleMode && (
        <>
          <ellipse cx="62" cy="90" rx="6" ry="4" fill="#fda4af" opacity="0.8" />
          <ellipse cx="118" cy="90" rx="6" ry="4" fill="#fda4af" opacity="0.8" />
        </>
      )}

      {/* Beak & Red Wattle */}
      <ellipse cx="90" cy="108" rx="7" ry="8" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
      {battleMode || isHappy ? (
        <>
          <path
            d="M80 90 L102 90 L91 104 Z"
            fill="#fb923c"
            stroke={INK}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          <path
            d="M83 92 L99 92 L91 101 Z"
            fill="#dc2626"
          />
        </>
      ) : (
        <path
          d="M82 90 L100 90 L91 101 Z"
          fill="#fb923c"
          stroke={INK}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/** Golden Speckled Hen — trusty partner to the White Hero Chicken! */
export function GoldenHenSvg({
  reaction = 'idle',
  battleMode = false,
  size = 136,
}: ChickenProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 165 160"
      fill="none"
      aria-label="Golden Speckled Chicken"
    >
      <ellipse cx="82" cy="149" rx="38" ry="7.5" fill="rgba(40,26,56,0.18)" />

      {/* Feet */}
      <path
        d="M66 130 L62 146 M62 146 L53 149 M62 146 L62 152 M62 146 L71 149"
        stroke="#ea580c"
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <path
        d="M98 130 L102 146 M102 146 L93 149 M102 146 L102 152 M102 146 L111 149"
        stroke="#ea580c"
        strokeWidth="4.8"
        strokeLinecap="round"
      />

      {/* Tail */}
      <path
        d="M122 102 Q146 84 140 70 Q128 74 122 86 Q134 66 124 58 Q114 66 110 84"
        fill="#f59e0b"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Golden Body */}
      <ellipse cx="82" cy="94" rx="42" ry="40" fill="#fbbf24" stroke={INK} strokeWidth="4.5" />
      {/* Cute golden speckles */}
      <circle cx="62" cy="112" r="3.5" fill="#d97706" />
      <circle cx="76" cy="118" r="3" fill="#d97706" />
      <circle cx="94" cy="116" r="3.5" fill="#d97706" />
      <circle cx="104" cy="106" r="3" fill="#d97706" />

      {/* Red Comb */}
      <path
        d="M62 56 C60 38 76 34 80 48 C86 32 102 38 98 56 Z"
        fill="#ef4444"
        stroke={INK}
        strokeWidth="4.2"
        strokeLinejoin="round"
      />

      {/* Flapping Wings */}
      <g className="svg-wing-left">
        <path
          d="M44 90 Q16 74 20 100 Q26 116 48 108 Z"
          fill="#f59e0b"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
      </g>
      <g className="svg-wing-right">
        <path
          d="M120 90 Q148 74 144 100 Q138 116 116 108 Z"
          fill="#f59e0b"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
      </g>

      {/* Eyes */}
      {battleMode ? (
        <>
          <circle cx="69" cy="78" r="7" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <circle cx="67" cy="78" r="3.2" fill={INK} />
          <circle cx="95" cy="78" r="7" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <circle cx="93" cy="78" r="3.2" fill={INK} />
          <path d="M58 68 L77 75" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M106 68 L87 75" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : isHappy ? (
        <>
          <path d="M62 79 Q69 71 76 79" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M88 79 Q95 71 102 79" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="69" cy="78" r="5.5" fill={INK} />
          <circle cx="71" cy="76" r="2" fill="#ffffff" />
          <circle cx="95" cy="78" r="5.5" fill={INK} />
          <circle cx="97" cy="76" r="2" fill="#ffffff" />
        </g>
      )}

      {/* Beak & Wattle */}
      <ellipse cx="82" cy="105" rx="6" ry="7" fill="#ef4444" stroke={INK} strokeWidth="3.2" />
      <path
        d="M73 88 L91 88 L82 99 Z"
        fill="#ea580c"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sneaky Cartoon Raccoon — panicked & dizzy when aggressively chased by Hero Chickens! */
export function RaccoonSvg({ panicked = false, size = 128 }: RaccoonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 170 160"
      fill="none"
      aria-label="Sneaky Raccoon"
    >
      {/* Spinning Dizzy Stars when chased! */}
      {panicked && (
        <g className="svg-sparkle-pulse">
          <ellipse
            cx="94"
            cy="22"
            rx="38"
            ry="10"
            stroke="#facc15"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <text x="52" y="25" fontSize="18">⭐</text>
          <text x="122" y="26" fontSize="16">💫</text>
        </g>
      )}

      {/* Striped Bushy Tail */}
      <g className="svg-tail">
        <path
          d="M64 116 C30 120 12 98 18 76 C24 58 46 62 54 80 C60 94 64 104 72 110 Z"
          fill="#94a3b8"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
        <path d="M22 86 Q34 88 44 84" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <path d="M28 102 Q42 102 52 96" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <circle cx="28" cy="70" r="8" fill="#334155" />
      </g>

      {/* Sprinting Legs */}
      <ellipse
        cx="78"
        cy="140"
        rx="14"
        ry="9"
        transform={panicked ? 'rotate(-24 78 140)' : undefined}
        fill="#334155"
        stroke={INK}
        strokeWidth="3.8"
      />
      <ellipse
        cx="114"
        cy="140"
        rx="14"
        ry="9"
        transform={panicked ? 'rotate(24 114 140)' : undefined}
        fill="#334155"
        stroke={INK}
        strokeWidth="3.8"
      />

      {/* Body */}
      <ellipse cx="94" cy="112" rx="30" ry="30" fill="#64748b" stroke={INK} strokeWidth="4.2" />
      <ellipse cx="98" cy="114" rx="18" ry="20" fill="#cbd5e1" />

      {/* Arms */}
      <ellipse
        cx="66"
        cy="100"
        rx="10"
        ry="16"
        transform={panicked ? 'rotate(54 66 100)' : 'rotate(24 66 100)'}
        fill="#334155"
        stroke={INK}
        strokeWidth="3.8"
      />
      <ellipse
        cx="124"
        cy="100"
        rx="10"
        ry="16"
        transform={panicked ? 'rotate(-54 124 100)' : 'rotate(-24 124 100)'}
        fill="#334155"
        stroke={INK}
        strokeWidth="3.8"
      />

      {/* Ears */}
      <path d="M68 52 L62 28 L86 42 Z" fill="#64748b" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M122 52 L128 28 L104 42 Z" fill="#64748b" stroke={INK} strokeWidth="4" strokeLinejoin="round" />

      {/* Head */}
      <ellipse cx="96" cy="64" rx="36" ry="29" fill="#94a3b8" stroke={INK} strokeWidth="4.2" />

      {/* Bandit Mask */}
      <path
        d="M62 60 Q96 50 130 60 Q128 76 110 74 Q96 68 82 74 Q64 76 62 60 Z"
        fill="#1e293b"
      />

      {/* Eyes */}
      {panicked ? (
        <>
          <circle cx="82" cy="64" r="8" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          <circle cx="80" cy="64" r="3" fill={INK} />
          <circle cx="110" cy="64" r="8" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          <circle cx="108" cy="64" r="3" fill={INK} />
        </>
      ) : (
        <>
          <circle cx="82" cy="64" r="6" fill="#ffffff" />
          <circle cx="80" cy="64" r="3" fill={INK} />
          <circle cx="110" cy="64" r="6" fill="#ffffff" />
          <circle cx="108" cy="64" r="3" fill={INK} />
        </>
      )}

      {/* White Snout & Nose */}
      <ellipse cx="96" cy="78" rx="16" ry="11" fill="#f1f5f9" stroke={INK} strokeWidth="3" />
      <ellipse cx="96" cy="73" rx="6" ry="4" fill={INK} />
      {panicked ? (
        <ellipse cx="96" cy="83" rx="7" ry="5" fill="#fb7185" stroke={INK} strokeWidth="2.8" />
      ) : (
        <path d="M88 81 Q96 86 104 80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

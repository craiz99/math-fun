import type { ReactionState } from '../../game/types';

interface CharProps {
  reaction?: ReactionState;
  size?: number;
}

const INK = '#281a38';

/** Cartoon Rumi — bright purple braid, yellow cropped jacket, glowing star wand! */
export function RumiSvg({ reaction = 'idle', size = 136 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';

  return (
    <svg width={size} height={size} viewBox="0 0 160 175" fill="none" aria-label="Rumi">
      <ellipse cx="82" cy="164" rx="30" ry="7" fill="rgba(40,26,56,0.18)" />

      {/* Long Bright Purple Braided Ponytail */}
      <g className="svg-tail">
        <circle cx="44" cy="54" r="16" fill="#a855f7" stroke={INK} strokeWidth="4" />
        <circle cx="34" cy="76" r="14" fill="#9333ea" stroke={INK} strokeWidth="4" />
        <circle cx="30" cy="98" r="12" fill="#a855f7" stroke={INK} strokeWidth="4" />
        <circle cx="28" cy="118" r="10" fill="#9333ea" stroke={INK} strokeWidth="4" />
        <path d="M22 126 L34 126 L28 140 Z" fill="#c084fc" stroke={INK} strokeWidth="3.5" />
      </g>

      {/* Legs & Dark Boots */}
      <rect x="66" y="124" width="12" height="28" rx="6" fill="#fed7aa" stroke={INK} strokeWidth="3.8" />
      <rect x="86" y="124" width="12" height="28" rx="6" fill="#fed7aa" stroke={INK} strokeWidth="3.8" />
      <rect x="64" y="140" width="16" height="18" rx="6" fill="#1e293b" stroke={INK} strokeWidth="3.8" />
      <rect x="84" y="140" width="16" height="18" rx="6" fill="#1e293b" stroke={INK} strokeWidth="3.8" />

      {/* Dark Shorts */}
      <rect x="62" y="114" width="40" height="18" rx="6" fill="#1e3a5f" stroke={INK} strokeWidth="4" />
      <line x1="64" y1="118" x2="100" y2="118" stroke="#ef4444" strokeWidth="4" />

      {/* Yellow Cropped Pop-Star Jacket + White Tee */}
      <rect x="58" y="84" width="48" height="32" rx="12" fill="#facc15" stroke={INK} strokeWidth="4.2" />
      <rect x="72" y="84" width="20" height="30" rx="5" fill="#ffffff" stroke={INK} strokeWidth="3" />

      {/* Glowing Star Lightstick / Wand in waving hand */}
      <g className="svg-arm-wave">
        <path d="M104 94 Q124 78 130 62" stroke="#facc15" strokeWidth="12" strokeLinecap="round" />
        <circle cx="130" cy="60" r="7.5" fill="#fed7aa" stroke={INK} strokeWidth="3.5" />
        <line x1="130" y1="54" x2="138" y2="30" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <g className="svg-sparkle-pulse">
          <path
            d="M139 10 L143 22 L156 23 L146 31 L149 43 L139 36 L129 43 L132 31 L122 23 L135 22 Z"
            fill="#fde047"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Head */}
      <ellipse cx="82" cy="56" rx="31" ry="28" fill="#fed7aa" stroke={INK} strokeWidth="4.2" />

      {/* Purple Top Hair */}
      <path
        d="M50 54 C48 26 68 18 84 18 C102 18 114 30 112 54 C104 40 94 36 82 40 C70 36 58 40 50 54 Z"
        fill="#a855f7"
        stroke={INK}
        strokeWidth="4.2"
        strokeLinejoin="round"
      />
      <ellipse cx="80" cy="20" rx="18" ry="11" fill="#c084fc" stroke={INK} strokeWidth="4" />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M64 56 Q70 49 76 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M88 56 Q94 49 100 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="70" cy="56" r="5.5" fill="#6b21a8" />
          <circle cx="72" cy="54" r="2" fill="#ffffff" />
          <circle cx="94" cy="56" r="5.5" fill="#6b21a8" />
          <circle cx="96" cy="54" r="2" fill="#ffffff" />
        </g>
      )}
      <ellipse cx="60" cy="65" rx="5" ry="3.2" fill="#f472b6" opacity="0.65" />
      <ellipse cx="104" cy="65" rx="5" ry="3.2" fill="#f472b6" opacity="0.65" />
      <path
        d={isHappy ? 'M72 68 Q82 79 92 68 Z' : 'M74 68 Q82 75 90 68'}
        fill={isHappy ? '#fb7185' : 'none'}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cartoon Zoey — dark space-buns, teal top, navy/yellow pants, star mic! */
export function ZoeySvg({ reaction = 'idle', size = 132 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';

  return (
    <svg width={size} height={size} viewBox="0 0 155 170" fill="none" aria-label="Zoey">
      <ellipse cx="78" cy="160" rx="28" ry="7" fill="rgba(40,26,56,0.18)" />

      {/* Cute Double Space Buns */}
      <circle cx="44" cy="34" r="15" fill="#1e1b4b" stroke={INK} strokeWidth="4" />
      <circle cx="112" cy="34" r="15" fill="#1e1b4b" stroke={INK} strokeWidth="4" />

      {/* Navy & Yellow Striped Pants */}
      <rect x="58" y="114" width="18" height="38" rx="9" fill="#1e3a5f" stroke={INK} strokeWidth="4" />
      <rect x="80" y="114" width="18" height="38" rx="9" fill="#1e3a5f" stroke={INK} strokeWidth="4" />
      <path d="M62 122 L72 134" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
      <path d="M94 122 L84 134" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />

      {/* Teal Pop-Star Top */}
      <rect x="58" y="84" width="40" height="32" rx="12" fill="#14b8a6" stroke={INK} strokeWidth="4.2" />

      {/* Waving Arm + Sparkle Mic */}
      <g className="svg-arm-wave">
        <path d="M58 94 Q36 80 34 62" stroke="#fed7aa" strokeWidth="11" strokeLinecap="round" />
        <circle cx="34" cy="60" r="7" fill="#fed7aa" stroke={INK} strokeWidth="3.2" />
        <g className="svg-sparkle-pulse">
          <path
            d="M32 34 L36 44 L46 46 L38 52 L40 62 L32 56 L24 62 L26 52 L18 46 L28 44 Z"
            fill="#c084fc"
            stroke={INK}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Head */}
      <ellipse cx="78" cy="56" rx="30" ry="27" fill="#fed7aa" stroke={INK} strokeWidth="4.2" />

      {/* Dark Hair with Cute Short Bangs */}
      <path
        d="M48 54 C48 26 64 20 78 20 C92 20 108 26 108 54 L100 42 L92 48 L82 40 L74 48 L64 40 L56 48 Z"
        fill="#1e1b4b"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M60 56 Q66 49 72 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M84 56 Q90 49 96 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="66" cy="56" r="5" fill={INK} />
          <circle cx="68" cy="54" r="1.8" fill="#ffffff" />
          <circle cx="90" cy="56" r="5" fill={INK} />
          <circle cx="92" cy="54" r="1.8" fill="#ffffff" />
        </g>
      )}
      <ellipse cx="57" cy="64" rx="5" ry="3" fill="#fb7185" opacity="0.65" />
      <ellipse cx="99" cy="64" rx="5" ry="3" fill="#fb7185" opacity="0.65" />
      <path
        d={isHappy ? 'M68 67 Q78 78 88 67 Z' : 'M70 67 Q78 74 86 67'}
        fill={isHappy ? '#fb7185' : 'none'}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cartoon Mira — long pink ponytail, black graphic tee, orange skirt, sparkle mic! */
export function MiraSvg({ reaction = 'idle', size = 136 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';

  return (
    <svg width={size} height={size} viewBox="0 0 160 175" fill="none" aria-label="Mira">
      <ellipse cx="78" cy="164" rx="30" ry="7" fill="rgba(40,26,56,0.18)" />

      {/* Long Rose-Pink High Ponytail */}
      <g className="svg-tail">
        <path
          d="M96 30 C134 26 146 66 138 118 C134 134 116 132 114 112 C112 86 108 62 96 50 Z"
          fill="#f472b6"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinejoin="round"
        />
      </g>

      {/* Tall Boots */}
      <rect x="62" y="130" width="14" height="28" rx="6" fill="#2d1b36" stroke={INK} strokeWidth="3.8" />
      <rect x="82" y="130" width="14" height="28" rx="6" fill="#2d1b36" stroke={INK} strokeWidth="3.8" />

      {/* Orange-Yellow Skirt */}
      <path
        d="M58 112 L98 112 L106 136 L50 136 Z"
        fill="#f59e0b"
        stroke={INK}
        strokeWidth="4.2"
        strokeLinejoin="round"
      />

      {/* Black Graphic Pop Tee */}
      <rect x="56" y="84" width="44" height="30" rx="11" fill="#1e1b4b" stroke={INK} strokeWidth="4.2" />
      <path d="M68 98 L78 90 L88 98 L78 106 Z" fill="#c084fc" />

      {/* Cheering Arm + Star Mic */}
      <g className="svg-arm-wave">
        <path d="M56 94 Q36 80 34 62" stroke="#fed7aa" strokeWidth="11" strokeLinecap="round" />
        <circle cx="34" cy="60" r="7" fill="#fed7aa" stroke={INK} strokeWidth="3.2" />
        <g className="svg-sparkle-pulse">
          <circle cx="30" cy="46" r="10" fill="#f472b6" stroke={INK} strokeWidth="3" />
          <text x="22" y="51" fontSize="13">⭐</text>
        </g>
      </g>

      {/* Head */}
      <ellipse cx="78" cy="56" rx="30" ry="27" fill="#fed7aa" stroke={INK} strokeWidth="4.2" />

      {/* Pink Front Hair */}
      <path
        d="M48 56 C48 26 64 20 78 20 C94 20 108 28 108 56 C100 42 88 38 78 44 C68 38 56 42 48 56 Z"
        fill="#f472b6"
        stroke={INK}
        strokeWidth="4.2"
        strokeLinejoin="round"
      />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M60 56 Q66 49 72 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M84 56 Q90 49 96 56" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="66" cy="56" r="5" fill="#be185d" />
          <circle cx="68" cy="54" r="1.8" fill="#ffffff" />
          <circle cx="90" cy="56" r="5" fill="#be185d" />
          <circle cx="92" cy="54" r="1.8" fill="#ffffff" />
        </g>
      )}
      <ellipse cx="57" cy="64" rx="5" ry="3" fill="#fb7185" opacity="0.65" />
      <ellipse cx="99" cy="64" rx="5" ry="3" fill="#fb7185" opacity="0.65" />
      <path
        d={isHappy ? 'M68 67 Q78 78 88 67 Z' : 'M70 67 Q78 74 86 67'}
        fill={isHappy ? '#fb7185' : 'none'}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cartoon Gwi-Ma — blazing neon-pink & violet flame monster from K-Pop Demon Hunters! */
export function GwiMaSvg({
  blasted = false,
  size = 190,
}: {
  blasted?: boolean;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 190 185" fill="none" aria-label="Gwi-Ma">
      <defs>
        <radialGradient id="gwimaGlow" cx="50%" cy="55%" r="52%">
          <stop offset="0%" stopColor="#ff2e93" />
          <stop offset="55%" stopColor="#a21caf" />
          <stop offset="100%" stopColor="#3b0764" />
        </radialGradient>
        <linearGradient id="gwimaFlame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#701a75" />
          <stop offset="48%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>

      {/* Blazing Outer Violet-Magenta Flame Aura */}
      <path
        className="gwima-flame-flicker"
        d="M24 146 C10 112 22 72 48 56 C44 34 64 16 84 30 C96 8 122 10 124 34 C146 24 166 44 156 68 C178 84 180 122 162 148 C144 172 46 174 24 146 Z"
        fill="url(#gwimaFlame)"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Inner Blazing Neon Core */}
      <path
        d="M42 144 C32 116 42 82 64 68 C74 44 114 42 126 68 C148 80 156 116 144 144 C128 164 60 166 42 144 Z"
        fill="url(#gwimaGlow)"
      />

      {/* Smoky Indigo Brow Ridge */}
      <path
        d="M48 76 Q74 62 94 78 Q116 62 142 76"
        stroke="#312e81"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Glowing Eyes — or Dizzy Swirls when blasted by Star Power! */}
      {blasted ? (
        <>
          <circle cx="70" cy="88" r="15" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <path d="M62 88 A8 8 0 1 1 78 88 A5 5 0 1 1 68 88" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="88" r="15" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <path d="M112 88 A8 8 0 1 1 128 88 A5 5 0 1 1 118 88" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          {/* Orbiting dizzy stars */}
          <text x="48" y="34" fontSize="20">⭐</text>
          <text x="122" y="34" fontSize="20">💫</text>
        </>
      ) : (
        <>
          <ellipse cx="70" cy="88" rx="14" ry="11" fill="#ff2e93" stroke={INK} strokeWidth="3" />
          <ellipse cx="70" cy="88" rx="7" ry="6" fill="#fef08a" />
          <ellipse cx="120" cy="88" rx="14" ry="11" fill="#ff2e93" stroke={INK} strokeWidth="3" />
          <ellipse cx="120" cy="88" rx="7" ry="6" fill="#fef08a" />
        </>
      )}

      {/* Jagged Blazing Wide Mouth */}
      {blasted ? (
        <path
          d="M64 134 Q95 112 126 134 Q114 148 95 144 Q76 148 64 134 Z"
          fill="#4a044e"
          stroke={INK}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M46 122 L62 114 L74 126 L88 112 L96 126 L108 112 L120 126 L132 114 L146 124 L132 146 L116 136 L102 150 L90 138 L76 150 L62 136 Z"
          fill="#ff4da6"
          stroke={INK}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}


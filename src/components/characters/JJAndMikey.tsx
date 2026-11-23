import type { ReactionState } from '../../game/types';

interface CharProps {
  reaction?: ReactionState;
  size?: number;
}

const INK = '#281a38';

/** Cartoon JJ — brown hair, bright blue eyes, red hoodie, purple sneakers! */
export function JJSvg({ reaction = 'idle', size = 148 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';
  const isEncourage = reaction === 'encourage';

  return (
    <svg width={size} height={size} viewBox="0 0 155 170" fill="none" aria-label="JJ">
      <ellipse cx="78" cy="160" rx="34" ry="7.5" fill="rgba(40,26,56,0.18)" />

      {/* Legs & Purple-Magenta Sneakers */}
      <rect x="56" y="122" width="18" height="24" rx="7" fill="#1e293b" stroke={INK} strokeWidth="4" />
      <rect x="82" y="122" width="18" height="24" rx="7" fill="#1e293b" stroke={INK} strokeWidth="4" />
      <rect x="52" y="142" width="24" height="14" rx="7" fill="#d946ef" stroke={INK} strokeWidth="4" />
      <rect x="80" y="142" width="24" height="14" rx="7" fill="#d946ef" stroke={INK} strokeWidth="4" />
      <line x1="56" y1="152" x2="72" y2="152" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="84" y1="152" x2="100" y2="152" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

      {/* Left Arm */}
      <g className={isHappy ? 'svg-arm-wave' : undefined}>
        <path
          d={isHappy ? 'M50 96 Q24 72 28 54' : 'M50 96 Q32 108 32 120'}
          stroke="#ef4444"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d={isHappy ? 'M50 96 Q24 72 28 54' : 'M50 96 Q32 108 32 120'}
          stroke={INK}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.18"
        />
        <circle cx={isHappy ? 28 : 32} cy={isHappy ? 52 : 122} r="9" fill="#fed7aa" stroke={INK} strokeWidth="3.8" />
      </g>

      {/* Right Arm Waving */}
      <g className="svg-arm-wave">
        <path
          d="M106 96 Q130 74 128 54"
          stroke="#ef4444"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="128" cy="52" r="9" fill="#fed7aa" stroke={INK} strokeWidth="3.8" />
      </g>

      {/* Red Hoodie Torso */}
      <rect x="48" y="84" width="60" height="44" rx="18" fill="#ef4444" stroke={INK} strokeWidth="4.5" />
      {/* White inner t-shirt & drawstrings */}
      <rect x="68" y="84" width="20" height="42" rx="6" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
      <line x1="71" y1="88" x2="71" y2="106" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="85" y1="88" x2="85" y2="106" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

      {/* Head */}
      <ellipse cx="78" cy="54" rx="35" ry="32" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />

      {/* Fluffy Brown Cartoon Hair */}
      <path
        d="M42 52 C40 24 62 14 82 16 C102 18 116 28 114 52 C108 38 96 36 86 40 C78 32 66 34 60 42 C52 38 46 44 42 52 Z"
        fill="#6b3e26"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Bright Blue Eyes */}
      {isHappy ? (
        <>
          <path d="M58 55 Q65 47 72 55" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M84 55 Q91 47 98 55" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="65" cy="55" r="7" fill="#ffffff" stroke={INK} strokeWidth="3" />
          <circle cx="66" cy="55" r="4.2" fill="#0ea5e9" />
          <circle cx="67.5" cy="53.5" r="1.8" fill="#ffffff" />
          <circle cx="91" cy="55" r="7" fill="#ffffff" stroke={INK} strokeWidth="3" />
          <circle cx="90" cy="55" r="4.2" fill="#0ea5e9" />
          <circle cx="91.5" cy="53.5" r="1.8" fill="#ffffff" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="53" cy="65" rx="6" ry="3.8" fill="#fb7185" opacity="0.65" />
      <ellipse cx="103" cy="65" rx="6" ry="3.8" fill="#fb7185" opacity="0.65" />

      {/* Mouth */}
      {isHappy ? (
        <path d="M66 68 Q78 82 90 68 Z" fill="#fb7185" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      ) : isEncourage ? (
        <path d="M70 71 Q78 76 86 71" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M68 68 Q78 78 88 68" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Cartoon Mikey — cheerful bright green turtle with yellow belly & silly tongue! */
export function MikeySvg({ reaction = 'idle', size = 138 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';
  const isEncourage = reaction === 'encourage';

  return (
    <svg width={size} height={size} viewBox="0 0 155 165" fill="none" aria-label="Mikey the Turtle">
      <ellipse cx="78" cy="154" rx="38" ry="7.5" fill="rgba(40,26,56,0.18)" />

      {/* Turtle Shell Rim Behind Body */}
      <ellipse cx="78" cy="108" rx="44" ry="36" fill="#15803d" stroke={INK} strokeWidth="4.5" />

      {/* Feet */}
      <ellipse cx="58" cy="144" rx="14" ry="10" fill="#4ade80" stroke={INK} strokeWidth="4" />
      <ellipse cx="98" cy="144" rx="14" ry="10" fill="#4ade80" stroke={INK} strokeWidth="4" />

      {/* Arms / Flippers */}
      <g className="svg-arm-wave">
        <ellipse
          cx="34"
          cy={isHappy ? 86 : 98}
          rx="12"
          ry="20"
          transform={isHappy ? 'rotate(-46 34 86)' : 'rotate(-30 34 98)'}
          fill="#4ade80"
          stroke={INK}
          strokeWidth="4"
        />
      </g>
      <ellipse
        cx="122"
        cy={isHappy ? 86 : 98}
        rx="12"
        ry="20"
        transform={isHappy ? 'rotate(46 122 86)' : 'rotate(30 122 98)'}
        fill="#4ade80"
        stroke={INK}
        strokeWidth="4"
      />

      {/* Yellow Segmented Turtle Belly */}
      <ellipse cx="78" cy="112" rx="30" ry="31" fill="#fde047" stroke={INK} strokeWidth="4.2" />
      <line x1="78" y1="84" x2="78" y2="140" stroke="#ca8a04" strokeWidth="3" />
      <line x1="52" y1="104" x2="104" y2="104" stroke="#ca8a04" strokeWidth="3" />
      <line x1="54" y1="122" x2="102" y2="122" stroke="#ca8a04" strokeWidth="3" />

      {/* Cute Rounded-Blocky Green Turtle Head */}
      <rect x="44" y="28" width="68" height="58" rx="26" fill="#4ade80" stroke={INK} strokeWidth="4.5" />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M56 54 Q63 46 70 54" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M86 54 Q93 46 100 54" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="62" cy="54" r="6" fill={INK} />
          <circle cx="64" cy="52" r="2.2" fill="#ffffff" />
          <circle cx="94" cy="54" r="6" fill={INK} />
          <circle cx="96" cy="52" r="2.2" fill="#ffffff" />
        </g>
      )}

      {/* Cheeks */}
      <ellipse cx="52" cy="64" rx="6" ry="3.8" fill="#86efac" />
      <ellipse cx="104" cy="64" rx="6" ry="3.8" fill="#86efac" />

      {/* Iconic Goofy Smile + Silly Red Tongue! */}
      {isEncourage ? (
        <path d="M68 69 Q78 75 88 69" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
      ) : (
        <>
          <path
            d="M64 65 Q78 80 92 65 Z"
            fill={INK}
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="81" cy="75" rx="7" ry="6" fill="#f43f5e" stroke={INK} strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

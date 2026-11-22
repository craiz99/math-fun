import type { ReactionState } from '../../game/types';

interface CharProps {
  reaction?: ReactionState;
  size?: number;
}

const INK = '#281a38';

export function GiantPandaSvg({ reaction = 'idle', size = 148 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';
  const isEncourage = reaction === 'encourage';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 165"
      fill="none"
      aria-label="Giant Panda"
    >
      {/* Shadow */}
      <ellipse cx="80" cy="154" rx="44" ry="8" fill="rgba(40,26,56,0.18)" />
      {/* Feet */}
      <ellipse cx="56" cy="144" rx="17" ry="12" fill="#2d2638" stroke={INK} strokeWidth="4" />
      <ellipse cx="104" cy="144" rx="17" ry="12" fill="#2d2638" stroke={INK} strokeWidth="4" />
      <circle cx="56" cy="145" r="5" fill="#f9a8d4" />
      <circle cx="104" cy="145" r="5" fill="#f9a8d4" />

      {/* Torso */}
      <ellipse cx="80" cy="112" rx="42" ry="38" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
      {/* Black chest band */}
      <path
        d="M42 100 Q80 116 118 100 Q116 84 80 86 Q44 84 42 100 Z"
        fill="#2d2638"
        stroke={INK}
        strokeWidth="3.5"
      />

      {/* Left Arm holding bamboo */}
      <g className={isHappy ? 'svg-arm-wave' : undefined}>
        <ellipse
          cx="36"
          cy={isHappy ? 86 : 102}
          rx="14"
          ry="22"
          transform={isHappy ? 'rotate(-36 36 86)' : 'rotate(24 36 102)'}
          fill="#2d2638"
          stroke={INK}
          strokeWidth="4"
        />
        {/* Bamboo stalk */}
        <g transform={isHappy ? 'translate(8, -14) rotate(-18 28 96)' : 'translate(0,0)'}>
          <rect
            x="22"
            y="62"
            width="10"
            height="58"
            rx="5"
            fill="#4ade80"
            stroke={INK}
            strokeWidth="3.5"
          />
          <line x1="22" y1="80" x2="32" y2="80" stroke={INK} strokeWidth="3" />
          <line x1="22" y1="98" x2="32" y2="98" stroke={INK} strokeWidth="3" />
          <ellipse
            cx="15"
            cy="72"
            rx="10"
            ry="5"
            transform="rotate(-28 15 72)"
            fill="#22c55e"
            stroke={INK}
            strokeWidth="3"
          />
          <ellipse
            cx="38"
            cy="68"
            rx="9"
            ry="4.5"
            transform="rotate(24 38 68)"
            fill="#22c55e"
            stroke={INK}
            strokeWidth="3"
          />
        </g>
      </g>

      {/* Right Arm waving */}
      <g className="svg-arm-wave">
        <ellipse
          cx="126"
          cy={isHappy ? 82 : 94}
          rx="14"
          ry="22"
          transform={isHappy ? 'rotate(42 126 82)' : 'rotate(30 126 94)'}
          fill="#2d2638"
          stroke={INK}
          strokeWidth="4"
        />
        <circle cx="134" cy={isHappy ? 68 : 80} r="4.5" fill="#f9a8d4" />
      </g>

      {/* Ears */}
      <circle cx="44" cy="34" r="16" fill="#2d2638" stroke={INK} strokeWidth="4.5" />
      <circle cx="116" cy="34" r="16" fill="#2d2638" stroke={INK} strokeWidth="4.5" />

      {/* Head */}
      <ellipse cx="80" cy="60" rx="44" ry="37" fill="#ffffff" stroke={INK} strokeWidth="4.5" />

      {/* Eye patches */}
      <ellipse
        cx="61"
        cy="58"
        rx="13"
        ry="15"
        transform="rotate(-14 61 58)"
        fill="#2d2638"
      />
      <ellipse
        cx="99"
        cy="58"
        rx="13"
        ry="15"
        transform="rotate(14 99 58)"
        fill="#2d2638"
      />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M54 57 Q61 49 68 57" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <path d="M92 57 Q99 49 106 57" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="62" cy="56" r="5" fill="#ffffff" />
          <circle cx="63" cy="55" r="2.2" fill={INK} />
          <circle cx="98" cy="56" r="5" fill="#ffffff" />
          <circle cx="97" cy="55" r="2.2" fill={INK} />
        </g>
      )}

      {/* Rosy cheeks */}
      <ellipse cx="46" cy="70" rx="7" ry="4.5" fill="#fda4af" opacity="0.8" />
      <ellipse cx="114" cy="70" rx="7" ry="4.5" fill="#fda4af" opacity="0.8" />

      {/* Nose & Mouth */}
      <ellipse cx="80" cy="66" rx="7" ry="5" fill={INK} />
      {isHappy ? (
        <path
          d="M68 74 Q80 88 92 74 Z"
          fill="#fb7185"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      ) : isEncourage ? (
        <path
          d="M72 76 Q80 81 88 76"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M71 74 Q75.5 80 80 75 Q84.5 80 89 74"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function RedPandaSvg({ reaction = 'idle', size = 142 }: CharProps) {
  const isHappy = reaction === 'happy' || reaction === 'celebrate';
  const isEncourage = reaction === 'encourage';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 175 165"
      fill="none"
      aria-label="Red Panda"
    >
      {/* Shadow */}
      <ellipse cx="78" cy="154" rx="40" ry="8" fill="rgba(40,26,56,0.18)" />

      {/* Fluffy Striped Wagging Tail */}
      <g className="svg-tail">
        <path
          d="M106 126 C140 132 164 108 160 80 C156 62 136 62 128 76 C120 90 112 104 102 112 Z"
          fill="#ea580c"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path d="M124 108 Q134 114 140 122" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
        <path d="M135 92 Q146 97 154 104" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
        <path d="M140 76 Q150 78 158 84" stroke="#7c2d12" strokeWidth="6" strokeLinecap="round" />
        <circle cx="151" cy="70" r="8" fill="#431407" />
      </g>

      {/* Dark legs */}
      <ellipse cx="58" cy="143" rx="14" ry="11" fill="#3b1d14" stroke={INK} strokeWidth="4" />
      <ellipse cx="98" cy="143" rx="14" ry="11" fill="#3b1d14" stroke={INK} strokeWidth="4" />

      {/* Body */}
      <ellipse cx="78" cy="112" rx="34" ry="34" fill="#ea580c" stroke={INK} strokeWidth="4.5" />
      {/* Dark belly */}
      <ellipse cx="78" cy="118" rx="22" ry="22" fill="#431407" />

      {/* Arms raised happily */}
      <g className="svg-arm-wave">
        <ellipse
          cx="42"
          cy={isHappy ? 88 : 98}
          rx="11"
          ry="19"
          transform={isHappy ? 'rotate(-42 42 88)' : 'rotate(-28 42 98)'}
          fill="#3b1d14"
          stroke={INK}
          strokeWidth="4"
        />
      </g>
      <ellipse
        cx="114"
        cy={isHappy ? 88 : 98}
        rx="11"
        ry="19"
        transform={isHappy ? 'rotate(42 114 88)' : 'rotate(28 114 98)'}
        fill="#3b1d14"
        stroke={INK}
        strokeWidth="4"
      />

      {/* Fluffy White-Rimmed Ears */}
      <path
        d="M38 48 L34 20 L62 32 Z"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M41 44 L39 28 L56 35 Z" fill="#c2410c" />
      <path
        d="M118 48 L122 20 L94 32 Z"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M115 44 L117 28 L100 35 Z" fill="#c2410c" />

      {/* Head */}
      <ellipse cx="78" cy="60" rx="40" ry="33" fill="#ea580c" stroke={INK} strokeWidth="4.5" />

      {/* White Red-Panda Cheek Mask & Eyebrow Spots */}
      <ellipse cx="52" cy="70" rx="16" ry="12" fill="#ffffff" />
      <ellipse cx="104" cy="70" rx="16" ry="12" fill="#ffffff" />
      <ellipse cx="78" cy="74" rx="18" ry="13" fill="#ffffff" />
      <ellipse cx="62" cy="46" rx="7" ry="5" fill="#ffffff" />
      <ellipse cx="94" cy="46" rx="7" ry="5" fill="#ffffff" />

      {/* Tear-stripe cheek markings */}
      <path d="M56 64 Q54 74 58 80" stroke="#9a3412" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 64 Q102 74 98 80" stroke="#9a3412" strokeWidth="5" strokeLinecap="round" />

      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M56 58 Q63 50 70 58" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M86 58 Q93 50 100 58" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <g className="svg-blink">
          <circle cx="63" cy="58" r="5.5" fill={INK} />
          <circle cx="65" cy="56" r="2" fill="#ffffff" />
          <circle cx="93" cy="58" r="5.5" fill={INK} />
          <circle cx="95" cy="56" r="2" fill="#ffffff" />
        </g>
      )}

      {/* Nose & Smile */}
      <ellipse cx="78" cy="67" rx="6" ry="4.5" fill={INK} />
      {isHappy ? (
        <path
          d="M68 74 Q78 86 88 74 Z"
          fill="#fb7185"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      ) : isEncourage ? (
        <path d="M71 76 Q78 81 85 76" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      ) : (
        <path
          d="M70 74 Q74 80 78 75 Q82 80 86 74"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

import type { SquadId } from '../../game/types';

export type BackdropTheme = SquadId | 'home' | 'win';

interface WorldBackdropProps {
  theme: BackdropTheme;
}

const INK = '#281a38';

export function WorldBackdrop({ theme }: WorldBackdropProps) {
  return (
    <div className="world-backdrop" aria-hidden="true">
      {theme === 'pandas' && <BambooGroveSvg />}
      {theme === 'chickens' && <SunnyFarmyardSvg />}
      {theme === 'jjmikey' && <AdventureParkSvg />}
      {theme === 'popstars' && <PopConcertStageSvg />}
      {(theme === 'home' || theme === 'win') && <RainbowPartySvg isWin={theme === 'win'} />}

      {/* Gentle floating musical notes so the world feels alive with pop music */}
      <span className="music-note-float" style={{ top: '12%', left: '14%', animationDelay: '0s' }}>
        🎵
      </span>
      <span className="music-note-float" style={{ top: '16%', right: '18%', animationDelay: '1.1s' }}>
        🎶
      </span>
      <span className="music-note-float" style={{ top: '26%', left: '46%', animationDelay: '2.2s' }}>
        ✨
      </span>
    </div>
  );
}

function BambooGroveSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bambooSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60d5ff" />
          <stop offset="65%" stopColor="#c7f4ff" />
          <stop offset="100%" stopColor="#e8ffd1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bambooSky)" />
      {/* Sun */}
      <circle cx="980" cy="110" r="64" fill="#fde047" stroke={INK} strokeWidth="4" />
      {/* Fluffy Clouds */}
      <g fill="#ffffff" opacity="0.92">
        <ellipse cx="220" cy="120" rx="68" ry="30" />
        <ellipse cx="265" cy="105" rx="52" ry="32" />
        <ellipse cx="720" cy="140" rx="74" ry="28" />
        <ellipse cx="768" cy="125" rx="48" ry="28" />
      </g>
      {/* Rolling Green Hills */}
      <path d="M0 540 Q280 410 580 520 Q900 400 1200 500 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />
      <path d="M0 610 Q360 520 720 600 Q980 540 1200 610 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4" />
      {/* Left Bamboo Stalks */}
      {[28, 72, 114].map((x, idx) => (
        <g key={x} transform={`rotate(${idx === 1 ? 2 : -2} ${x} 800)`}>
          <rect x={x} y="-20" width="24" height="840" rx="8" fill={idx === 1 ? '#22c55e' : '#4ade80'} stroke={INK} strokeWidth="3.5" />
          {[120, 260, 400, 540, 680].map((y) => (
            <line key={y} x1={x} y1={y} x2={x + 24} y2={y} stroke={INK} strokeWidth="3.5" />
          ))}
          <ellipse cx={x + 38} cy={180 + idx * 60} rx="26" ry="10" transform={`rotate(-20 ${x + 38} ${180 + idx * 60})`} fill="#22c55e" stroke={INK} strokeWidth="3" />
        </g>
      ))}
      {/* Right Bamboo Stalks */}
      {[1070, 1118, 1158].map((x, idx) => (
        <g key={x}>
          <rect x={x} y="-20" width="24" height="840" rx="8" fill={idx === 1 ? '#22c55e' : '#4ade80'} stroke={INK} strokeWidth="3.5" />
          {[140, 280, 420, 560, 700].map((y) => (
            <line key={y} x1={x} y1={y} x2={x + 24} y2={y} stroke={INK} strokeWidth="3.5" />
          ))}
          <ellipse cx={x - 16} cy={200 + idx * 50} rx="24" ry="10" transform={`rotate(24 ${x - 16} ${200 + idx * 50})`} fill="#22c55e" stroke={INK} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

function SunnyFarmyardSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#farmSky)" />
      {/* Big cheerful sun */}
      <circle cx="1050" cy="115" r="66" fill="#fde047" stroke={INK} strokeWidth="4" />
      {/* Clouds */}
      <g fill="#ffffff" opacity="0.92">
        <ellipse cx="260" cy="130" rx="76" ry="30" />
        <ellipse cx="315" cy="112" rx="54" ry="30" />
        <ellipse cx="690" cy="115" rx="64" ry="26" />
      </g>
      {/* Distant green hills */}
      <path d="M0 530 Q300 420 620 510 Q920 430 1200 500 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />
      {/* Classic Red Cartoon Barn */}
      <g transform="translate(815, 290)">
        <polygon points="150,0 285,82 285,265 15,265 15,82" fill="#ef4444" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <polyline points="0,92 150,-6 300,92" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="0,92 150,-6 300,92" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Barn Hay Window */}
        <rect x="118" y="64" width="64" height="48" rx="6" fill="#7f1d1d" stroke="#ffffff" strokeWidth="6" />
        {/* Barn Doors */}
        <rect x="85" y="142" width="130" height="123" fill="#dc2626" stroke="#ffffff" strokeWidth="7" />
        <line x1="85" y1="142" x2="215" y2="265" stroke="#ffffff" strokeWidth="6" />
        <line x1="215" y1="142" x2="85" y2="265" stroke="#ffffff" strokeWidth="6" />
      </g>
      {/* Wooden Fence */}
      <g stroke={INK} strokeWidth="3.5" fill="#d97706">
        <rect x="0" y="535" width="760" height="14" rx="4" />
        <rect x="0" y="570" width="760" height="14" rx="4" />
        {[60, 170, 280, 390, 500, 610, 720].map((x) => (
          <rect key={x} x={x} y="512" width="18" height="96" rx="5" fill="#b45309" />
        ))}
      </g>
      {/* Foreground Meadow */}
      <path d="M0 595 Q420 555 820 595 Q1020 570 1200 600 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4.5" />
    </svg>
  );
}

function AdventureParkSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="advSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="68%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#advSky)" />
      {/* Playful Rainbow Arch */}
      <path d="M180 560 A420 420 0 0 1 1020 560" fill="none" stroke="#fb7185" strokeWidth="26" opacity="0.5" />
      <path d="M206 560 A394 394 0 0 1 994 560" fill="none" stroke="#facc15" strokeWidth="26" opacity="0.5" />
      <path d="M232 560 A368 368 0 0 1 968 560" fill="none" stroke="#4ade80" strokeWidth="26" opacity="0.5" />
      <path d="M258 560 A342 342 0 0 1 942 560" fill="none" stroke="#38bdf8" strokeWidth="26" opacity="0.5" />
      {/* Cute blocky-cartoon clouds */}
      <g fill="#ffffff" stroke={INK} strokeWidth="3.5" opacity="0.95">
        <rect x="130" y="105" width="120" height="44" rx="16" />
        <rect x="160" y="84" width="66" height="36" rx="14" />
        <rect x="860" y="96" width="130" height="46" rx="16" />
        <rect x="892" y="74" width="68" height="36" rx="14" />
      </g>
      {/* Adventure Hills & Playful Blocky Trees */}
      <path d="M0 555 Q340 465 680 545 Q960 480 1200 545 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />
      {[88, 1060].map((x) => (
        <g key={x} transform={`translate(${x}, 435)`}>
          <rect x="30" y="72" width="28" height="88" rx="6" fill="#92400e" stroke={INK} strokeWidth="4" />
          <rect x="0" y="10" width="88" height="72" rx="18" fill="#22c55e" stroke={INK} strokeWidth="4" />
          <rect x="18" y="-14" width="52" height="36" rx="12" fill="#4ade80" stroke={INK} strokeWidth="4" />
        </g>
      ))}
      <path d="M0 620 Q420 570 860 625 Q1050 600 1200 625 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4.5" />
    </svg>
  );
}

function PopConcertStageSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="popSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="48%" stopColor="#f5d0fe" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#popSky)" />
      {/* Concert Spotlights */}
      <polygon points="160,0 440,800 60,800" fill="#ffffff" opacity="0.22" />
      <polygon points="1040,0 1140,800 760,800" fill="#ffffff" opacity="0.22" />
      <polygon points="600,0 820,800 380,800" fill="#fef08a" opacity="0.2" />
      {/* Glowing Rainbow Stage Arch */}
      <path d="M220 620 A380 380 0 0 1 980 620" fill="none" stroke="#f472b6" strokeWidth="28" opacity="0.65" />
      <path d="M248 620 A352 352 0 0 1 952 620" fill="none" stroke="#fde047" strokeWidth="28" opacity="0.7" />
      <path d="M276 620 A324 324 0 0 1 924 620" fill="none" stroke="#5eead4" strokeWidth="28" opacity="0.7" />
      {/* Twinkling Stage Stars */}
      <g fill="#fef08a" stroke={INK} strokeWidth="2.5" opacity="0.85">
        <circle cx="140" cy="180" r="14" />
        <circle cx="1060" cy="200" r="16" />
        <circle cx="595" cy="120" r="18" />
      </g>
      {/* Glossy Stage Floor */}
      <ellipse cx="600" cy="760" rx="720" ry="180" fill="#f9a8d4" stroke={INK} strokeWidth="4.5" />
      <ellipse cx="600" cy="770" rx="560" ry="125" fill="#fbcfe8" />
    </svg>
  );
}

function RainbowPartySvg({ isWin }: { isWin: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="partyBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isWin ? '#818cf8' : '#7dd3fc'} />
          <stop offset="52%" stopColor={isWin ? '#f472b6' : '#fef9c3'} />
          <stop offset="100%" stopColor={isWin ? '#fde047' : '#bae6fd'} />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#partyBg)" />
      {/* Sunburst beams */}
      <g opacity={isWin ? '0.24' : '0.18'} fill="#ffffff">
        <polygon points="600,400 0,0 240,0" />
        <polygon points="600,400 460,0 740,0" />
        <polygon points="600,400 960,0 1200,0" />
        <polygon points="600,400 1200,260 1200,520" />
        <polygon points="600,400 0,260 0,520" />
      </g>
      {/* Soft clouds along bottom */}
      <g fill="#ffffff" opacity="0.88">
        <ellipse cx="140" cy="760" rx="220" ry="90" />
        <ellipse cx="440" cy="780" rx="240" ry="95" />
        <ellipse cx="780" cy="775" rx="250" ry="95" />
        <ellipse cx="1080" cy="760" rx="220" ry="90" />
      </g>
    </svg>
  );
}

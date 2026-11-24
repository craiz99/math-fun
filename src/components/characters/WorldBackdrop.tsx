import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import {
  WORLD_AMBIENT_TAPS,
  type WorldBackdropTheme,
} from './characterInteractions';

export type BackdropTheme = WorldBackdropTheme;

interface WorldBackdropProps {
  theme: BackdropTheme;
}

interface TapBurst {
  id: number;
  x: number;
  y: number;
  particles: string[];
  label?: string;
}

interface PropTriggerOptions {
  particles: string[];
  label?: string;
  sound: () => void;
  durationMs?: number;
}

type PropTriggerFn = (
  propKey: string,
  e: MouseEvent<SVGElement | HTMLElement>,
  options: PropTriggerOptions
) => void;

interface SceneProps {
  isActive: (key: string) => boolean;
  onPropTap: PropTriggerFn;
}

const INK = '#281a38';

const BURST_VECTORS: ReadonlyArray<{ dx: string; dy: string; rot: string }> = [
  { dx: '-46px', dy: '-54px', rot: '-24deg' },
  { dx: '-16px', dy: '-76px', rot: '-10deg' },
  { dx: '22px', dy: '-74px', rot: '14deg' },
  { dx: '48px', dy: '-50px', rot: '26deg' },
];

const FLOATING_NOTES = [
  { key: 'float-note-0', icon: '🎵', style: { top: '10%', left: '16%', animationDelay: '0s' } },
  { key: 'float-note-1', icon: '🎶', style: { top: '14%', right: '14%', animationDelay: '1.1s' } },
  { key: 'float-note-2', icon: '✨', style: { top: '24%', left: '49%', animationDelay: '2.2s' } },
] as const;

export function WorldBackdrop({ theme }: WorldBackdropProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const burstIdRef = useRef(0);
  const propTimersRef = useRef<Record<string, number>>({});
  const burstTimersRef = useRef<number[]>([]);

  const [bursts, setBursts] = useState<TapBurst[]>([]);
  const [activeProps, setActiveProps] = useState<Record<string, number>>({});

  useEffect(() => {
    const propTimers = propTimersRef.current;
    const burstTimers = burstTimersRef.current;
    return () => {
      Object.values(propTimers).forEach((id) => window.clearTimeout(id));
      burstTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const spawnBurstAt = useCallback(
    (clientX: number, clientY: number, particles: string[], label?: string) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      burstIdRef.current += 1;
      const id = burstIdRef.current;

      setBursts((prev) => [...prev.slice(-14), { id, x, y, particles, label }]);
      const timerId = window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
        burstTimersRef.current = burstTimersRef.current.filter((t) => t !== timerId);
      }, 880);
      burstTimersRef.current.push(timerId);
    },
    []
  );

  const handlePropTap: PropTriggerFn = useCallback(
    (propKey, e, { particles, label, sound, durationMs = 650 }) => {
      e.stopPropagation();
      soundEngine.unlock();
      sound();
      spawnBurstAt(e.clientX, e.clientY, particles, label);

      const existingTimer = propTimersRef.current[propKey];
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }

      // Clear and re-apply on next frame so rapid taps replay the animation smoothly
      setActiveProps((prev) => {
        const next = { ...prev };
        delete next[propKey];
        return next;
      });
      window.requestAnimationFrame(() => {
        setActiveProps((prev) => ({ ...prev, [propKey]: (prev[propKey] ?? 0) + 1 }));
      });

      propTimersRef.current[propKey] = window.setTimeout(() => {
        setActiveProps((prev) => {
          const next = { ...prev };
          delete next[propKey];
          return next;
        });
        delete propTimersRef.current[propKey];
      }, durationMs);
    },
    [spawnBurstAt]
  );

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const xRatio = rect && rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
      const ambient = WORLD_AMBIENT_TAPS[theme];
      soundEngine.unlock();
      soundEngine.playSparklePop(xRatio);
      spawnBurstAt(e.clientX, e.clientY, ambient.particles);
    },
    [spawnBurstAt, theme]
  );

  const isActive = useCallback((key: string) => activeProps[key] !== undefined, [activeProps]);

  return (
    <div
      ref={containerRef}
      className="world-backdrop"
      onClick={handleBackdropClick}
      aria-label="Interactive animated world background"
    >
      {theme === 'pandas' && <BambooGroveSvg isActive={isActive} onPropTap={handlePropTap} />}
      {theme === 'chickens' && <SunnyFarmyardSvg isActive={isActive} onPropTap={handlePropTap} />}
      {theme === 'jjmikey' && <AdventureParkSvg isActive={isActive} onPropTap={handlePropTap} />}
      {theme === 'popstars' && <PopConcertStageSvg isActive={isActive} onPropTap={handlePropTap} />}
      {theme === 'home' && <HomeMeadowSvg isActive={isActive} onPropTap={handlePropTap} />}
      {theme === 'win' && <WinConcertSvg isActive={isActive} onPropTap={handlePropTap} />}

      {/* Gentle clickable floating musical notes across every world */}
      {FLOATING_NOTES.map((note, idx) => (
        <span
          key={note.key}
          className={`music-note-float interactive ${isActive(note.key) ? 'bg-react-boing' : ''}`}
          style={note.style}
          onClick={(e) =>
            handlePropTap(note.key, e, {
              particles: ['🎵', '🎶', '✨', '⭐'],
              label: 'Ding!',
              sound: () => soundEngine.playFlowerPluck(idx * 2 + 2),
            })
          }
          aria-hidden="true"
        >
          {note.icon}
        </span>
      ))}

      {/* Floating tap particle bursts */}
      <div className="bg-burst-layer" aria-hidden="true">
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="bg-burst-origin"
            style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
          >
            {burst.label && <span className="bg-burst-label">{burst.label}</span>}
            {BURST_VECTORS.map((vec, i) => (
              <span
                key={i}
                className="bg-burst-particle"
                style={
                  {
                    '--dx': vec.dx,
                    '--dy': vec.dy,
                    '--rot': vec.rot,
                    animationDelay: `${i * 0.03}s`,
                  } as CSSProperties
                }
              >
                {burst.particles[i % burst.particles.length]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 1. Panda Pals — Lush Animated Bamboo Forest with Waterfall, Butterflies & Drifting Petals */
function BambooGroveSvg({ isActive, onPropTap }: SceneProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bambooSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="45%" stopColor="#bef264" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
        <linearGradient id="waterfallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      <rect width="1200" height="800" fill="#99f6e4" />
      <rect width="1200" height="800" fill="url(#bambooSky)" />

      {/* Warm golden sunbeams from upper-right */}
      <g className="bg-sun-pulse" opacity="0.34" fill="#fef08a" style={{ pointerEvents: 'none' }}>
        <polygon points="1040,0 640,800 820,800" />
        <polygon points="1120,0 890,800 1050,800" />
        <polygon points="940,0 380,800 520,800" />
      </g>

      {/* Drifting fluffy clickable clouds */}
      <g className="bg-cloud-drift" fill="#ffffff" opacity="0.9">
        <g
          className={`bg-clickable ${isActive('bamboo-cloud-1') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('bamboo-cloud-1', e, {
              particles: ['☁️', '✨', '💧', '🌸'],
              label: 'Poof!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="260" cy="110" rx="76" ry="30" />
          <ellipse cx="315" cy="94" rx="54" ry="30" />
        </g>
        <g
          className={`bg-clickable ${isActive('bamboo-cloud-2') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('bamboo-cloud-2', e, {
              particles: ['☁️', '✨', '💧', '🌸'],
              label: 'Fluffy!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="750" cy="100" rx="82" ry="30" />
          <ellipse cx="810" cy="85" rx="52" ry="28" />
        </g>
      </g>

      {/* Distant misty emerald mountains */}
      <path d="M0 440 Q180 260 390 400 Q580 240 820 390 Q1020 260 1200 390 L1200 800 L0 800 Z" fill="#6ee7b7" />
      <path d="M0 500 Q260 360 540 470 Q840 350 1200 470 L1200 800 L0 800 Z" fill="#34d399" stroke={INK} strokeWidth="3.5" />

      {/* Cliff & Animated Clickable Sparkling Waterfall */}
      <path d="M560 410 Q660 390 770 420 L795 620 L535 620 Z" fill="#10b981" stroke={INK} strokeWidth="3.5" />
      <g
        className={`bg-clickable ${isActive('waterfall') ? 'bg-react-splash' : ''}`}
        onClick={(e) =>
          onPropTap('waterfall', e, {
            particles: ['💧', '💦', '🫧', '✨'],
            label: 'Splash!',
            sound: () => soundEngine.playWaterSplash(),
          })
        }
      >
        <rect x="612" y="420" width="110" height="205" rx="22" fill="url(#waterfallGrad)" stroke={INK} strokeWidth="3.5" />
        <g className="bg-water-flow" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeDasharray="24 22" opacity="0.85">
          <line x1="638" y1="430" x2="638" y2="615" />
          <line x1="668" y1="445" x2="668" y2="615" />
          <line x1="698" y1="432" x2="698" y2="615" />
        </g>
        {/* Waterfall foam mist */}
        <g className="bg-ripple" fill="#ffffff" opacity="0.92">
          <ellipse cx="635" cy="618" rx="32" ry="15" />
          <ellipse cx="670" cy="622" rx="38" ry="17" />
          <ellipse cx="705" cy="618" rx="30" ry="14" />
        </g>
      </g>

      {/* Turquoise Clickable Pond & Ripples */}
      <g
        className={`bg-clickable ${isActive('bamboo-pond') ? 'bg-react-splash' : ''}`}
        onClick={(e) =>
          onPropTap('bamboo-pond', e, {
            particles: ['💧', '🐟', '💦', '🫧'],
            label: 'Splish!',
            sound: () => soundEngine.playWaterSplash(),
          })
        }
      >
        <ellipse cx="660" cy="695" rx="270" ry="95" fill="#38bdf8" stroke={INK} strokeWidth="3.5" />
        <ellipse className="bg-ripple" cx="655" cy="685" rx="140" ry="28" fill="none" stroke="#e0f2fe" strokeWidth="5" />
        <ellipse className="bg-ripple" cx="715" cy="730" rx="85" ry="16" fill="none" stroke="#bae6fd" strokeWidth="4" style={{ animationDelay: '0.8s' }} />
      </g>

      {/* Foreground Lush Grassy Bank */}
      <path d="M0 570 Q240 535 450 615 Q520 670 480 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4" />
      <path d="M780 650 Q980 575 1200 610 L1200 800 L740 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4" />

      {/* Swaying Clickable Left Bamboo Forest */}
      {[20, 66, 114, 162].map((x, idx) => (
        <g key={x} className="bg-sway-slow" style={{ animationDelay: `${idx * 0.45}s`, transformOrigin: `${x + 12}px 800px` }}>
          <g
            className={`bg-clickable ${isActive(`bamboo-l-${idx}`) ? 'bg-react-shake' : ''}`}
            onClick={(e) =>
              onPropTap(`bamboo-l-${idx}`, e, {
                particles: ['🎋', '🍃', '🌿', '✨'],
                label: 'Clack!',
                sound: () => soundEngine.playWoodMarimba(idx),
              })
            }
          >
            <rect x={x} y="-20" width="24" height="840" rx="8" fill={idx % 2 === 0 ? '#4ade80' : '#22c55e'} stroke={INK} strokeWidth="3.5" />
            {[110, 240, 370, 500, 630].map((y) => (
              <line key={y} x1={x} y1={y} x2={x + 24} y2={y} stroke={INK} strokeWidth="3.2" />
            ))}
            <ellipse cx={x + 38} cy={160 + idx * 55} rx="28" ry="10" transform={`rotate(-22 ${x + 38} ${160 + idx * 55})`} fill="#22c55e" stroke={INK} strokeWidth="3" />
            <ellipse cx={x - 14} cy={290 + idx * 45} rx="24" ry="9" transform={`rotate(24 ${x - 14} ${290 + idx * 45})`} fill="#86efac" stroke={INK} strokeWidth="3" />
          </g>
        </g>
      ))}

      {/* Swaying Clickable Right Bamboo Forest */}
      {[1028, 1078, 1126, 1168].map((x, idx) => (
        <g key={x} className="bg-sway-slow" style={{ animationDelay: `${idx * 0.35 + 0.2}s`, transformOrigin: `${x + 12}px 800px` }}>
          <g
            className={`bg-clickable ${isActive(`bamboo-r-${idx}`) ? 'bg-react-shake' : ''}`}
            onClick={(e) =>
              onPropTap(`bamboo-r-${idx}`, e, {
                particles: ['🎋', '🍃', '🌿', '✨'],
                label: 'Clack!',
                sound: () => soundEngine.playWoodMarimba(idx + 2),
              })
            }
          >
            <rect x={x} y="-20" width="24" height="840" rx="8" fill={idx % 2 === 0 ? '#22c55e' : '#4ade80'} stroke={INK} strokeWidth="3.5" />
            {[130, 260, 390, 520, 650].map((y) => (
              <line key={y} x1={x} y1={y} x2={x + 24} y2={y} stroke={INK} strokeWidth="3.2" />
            ))}
            <ellipse cx={x - 18} cy={180 + idx * 50} rx="26" ry="10" transform={`rotate(24 ${x - 18} ${180 + idx * 50})`} fill="#4ade80" stroke={INK} strokeWidth="3" />
          </g>
        </g>
      ))}

      {/* Fluttering Clickable Cartoon Butterflies */}
      <g transform="translate(460, 320)">
        <g className="bg-butterfly-flight">
          <g
            className={`bg-clickable ${isActive('butterfly-1') ? 'bg-react-flutter' : ''}`}
            onClick={(e) =>
              onPropTap('butterfly-1', e, {
                particles: ['🦋', '💛', '✨', '🌸'],
                label: 'Flutter!',
                sound: () => soundEngine.playFlutterChime(),
              })
            }
          >
            <circle cx="0" cy="0" r="34" fill="transparent" />
            <ellipse cx="-10" cy="-6" rx="11" ry="8" fill="#facc15" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="10" cy="-6" rx="11" ry="8" fill="#facc15" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="-8" cy="6" rx="8" ry="6" fill="#fde047" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="8" cy="6" rx="8" ry="6" fill="#fde047" stroke={INK} strokeWidth="2.5" />
            <rect x="-2.5" y="-10" width="5" height="20" rx="2.5" fill={INK} />
          </g>
        </g>
      </g>
      <g transform="translate(650, 265)">
        <g className="bg-butterfly-flight" style={{ animationDelay: '-1.6s' }}>
          <g
            className={`bg-clickable ${isActive('butterfly-2') ? 'bg-react-flutter' : ''}`}
            onClick={(e) =>
              onPropTap('butterfly-2', e, {
                particles: ['🦋', '💙', '✨', '🌸'],
                label: 'Flutter!',
                sound: () => soundEngine.playFlutterChime(),
              })
            }
          >
            <circle cx="0" cy="0" r="34" fill="transparent" />
            <ellipse cx="-10" cy="-6" rx="10" ry="7.5" fill="#38bdf8" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="10" cy="-6" rx="10" ry="7.5" fill="#38bdf8" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="-7" cy="5" rx="7" ry="5" fill="#7dd3fc" stroke={INK} strokeWidth="2.5" />
            <ellipse cx="7" cy="5" rx="7" ry="5" fill="#7dd3fc" stroke={INK} strokeWidth="2.5" />
            <rect x="-2" y="-9" width="4" height="18" rx="2" fill={INK} />
          </g>
        </g>
      </g>

      {/* Drifting Cherry Blossom Petals */}
      {[
        { x: 260, y: 180, d: '0s' },
        { x: 430, y: 240, d: '1.1s' },
        { x: 610, y: 140, d: '2.2s' },
        { x: 780, y: 210, d: '0.6s' },
        { x: 920, y: 170, d: '1.8s' },
      ].map((p, i) => (
        <ellipse
          key={i}
          className="bg-petal-fall"
          cx={p.x}
          cy={p.y}
          rx="9"
          ry="5"
          fill="#fbcfe8"
          stroke="#f472b6"
          strokeWidth="1.5"
          style={{ animationDelay: p.d, pointerEvents: 'none' }}
        />
      ))}
    </svg>
  );
}

/** 2. Hero Chicken Crew — Detailed Animated Sunny Farmyard (Spinning Windmill, Red Barn, Apple Trees, Pond & Bees!) */
function SunnyFarmyardSvg({ isActive, onPropTap }: SceneProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#farmSky)" />

      {/* Spinning Radiant Clickable Cartoon Sun */}
      <g transform="translate(1055, 110)">
        <g
          className={`bg-clickable ${isActive('farm-sun') ? 'bg-react-sun-burst' : ''}`}
          onClick={(e) =>
            onPropTap('farm-sun', e, {
              particles: ['☀️', '✨', '🌟', '💛'],
              label: 'Sunny!',
              sound: () => soundEngine.playSunChime(),
            })
          }
        >
          <g className="bg-sun-spin">
            {Array.from({ length: 10 }).map((_, i) => (
              <rect
                key={i}
                x="-7"
                y="-92"
                width="14"
                height="24"
                rx="7"
                fill="#facc15"
                stroke={INK}
                strokeWidth="2.5"
                transform={`rotate(${i * 36})`}
              />
            ))}
          </g>
          <circle cx="0" cy="0" r="56" fill="#fde047" stroke={INK} strokeWidth="4" />
        </g>
      </g>

      {/* Drifting Fluffy Clickable Clouds */}
      <g className="bg-cloud-drift" fill="#ffffff" opacity="0.94">
        <g
          className={`bg-clickable ${isActive('farm-cloud-1') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('farm-cloud-1', e, {
              particles: ['☁️', '✨', '💧', '☀️'],
              label: 'Poof!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="240" cy="120" rx="76" ry="30" />
          <ellipse cx="298" cy="102" rx="54" ry="30" />
        </g>
        <g
          className={`bg-clickable ${isActive('farm-cloud-2') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('farm-cloud-2', e, {
              particles: ['☁️', '✨', '💧', '☀️'],
              label: 'Fluffy!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="640" cy="108" rx="70" ry="26" />
          <ellipse cx="690" cy="96" rx="46" ry="24" />
        </g>
      </g>

      {/* Rolling Sunny Hills */}
      <path d="M0 500 Q260 390 540 480 Q860 385 1200 470 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />

      {/* Charming Hillside Clickable Wooden Windmill with Turbo-Spin Sails! */}
      <g transform="translate(565, 290)">
        <g
          className="bg-clickable"
          onClick={(e) =>
            onPropTap('windmill', e, {
              particles: ['💨', '🍃', '✨', '⭐'],
              label: 'Whoosh!',
              sound: () => soundEngine.playWindWhoosh(),
              durationMs: 1600,
            })
          }
        >
          <polygon points="34,58 76,58 92,205 18,205" fill="#d97706" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M26 58 Q55 24 84 58 Z" fill="#b45309" stroke={INK} strokeWidth="4" />
          <rect x="44" y="150" width="22" height="55" rx="10" fill="#78350f" stroke={INK} strokeWidth="3.5" />
          <circle cx="55" cy="104" r="10" fill="#fef08a" stroke={INK} strokeWidth="3" />
          {/* Spinning Windmill Blades */}
          <g transform="translate(55, 62)">
            <g className={`bg-windmill-spin ${isActive('windmill') ? 'bg-react-turbo-spin' : ''}`}>
              {[0, 90, 180, 270].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <line x1="0" y1="0" x2="0" y2="-86" stroke={INK} strokeWidth="6" strokeLinecap="round" />
                  <rect x="4" y="-82" width="22" height="58" rx="4" fill="#fef3c7" stroke={INK} strokeWidth="3" />
                </g>
              ))}
              <circle cx="0" cy="0" r="11" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
            </g>
          </g>
        </g>
      </g>

      {/* Classic Detailed Clickable Red Barn + Rocking Rooster Weathervane */}
      <g transform="translate(760, 270)">
        <g
          className={`bg-clickable ${isActive('barn') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('barn', e, {
              particles: ['🐔', '🌾', '⭐', '🥚'],
              label: 'Bawk-bawk!',
              sound: () => soundEngine.playChickenBawk(),
            })
          }
        >
          {/* Weathervane */}
          <g className="bg-sway-slow" style={{ transformOrigin: '145px 0px' }}>
            <line x1="145" y1="-44" x2="145" y2="2" stroke={INK} strokeWidth="5" />
            <line x1="120" y1="-22" x2="170" y2="-22" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
            <circle cx="148" cy="-38" r="11" fill="#facc15" stroke={INK} strokeWidth="3" />
            <path d="M142 -48 L152 -54 L156 -44 Z" fill="#ef4444" stroke={INK} strokeWidth="2.5" />
          </g>
          <polygon points="145,0 278,84 278,265 12,265 12,84" fill="#ef4444" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <polyline points="-4,94 145,-6 294,94" fill="none" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="-4,94 145,-6 294,94" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hayloft with golden hay */}
          <rect x="112" y="64" width="66" height="50" rx="6" fill="#7f1d1d" stroke="#ffffff" strokeWidth="6" />
          <path d="M118 112 Q145 92 172 112 Z" fill="#facc15" />
          {/* Barn Doors */}
          <rect x="82" y="142" width="126" height="123" fill="#dc2626" stroke="#ffffff" strokeWidth="7" />
          <line x1="82" y1="142" x2="208" y2="265" stroke="#ffffff" strokeWidth="6" />
          <line x1="208" y1="142" x2="82" y2="265" stroke="#ffffff" strokeWidth="6" />
        </g>
      </g>

      {/* Lush Clickable Apple Tree on Left */}
      <g className="bg-sway-slow" style={{ transformOrigin: '105px 540px' }}>
        <g
          className={`bg-clickable ${isActive('apple-tree') ? 'bg-react-shake' : ''}`}
          onClick={(e) =>
            onPropTap('apple-tree', e, {
              particles: ['🍎', '🍏', '🍃', '✨'],
              label: 'Plop!',
              sound: () => soundEngine.playApplePop(),
            })
          }
        >
          <rect x="86" y="425" width="38" height="135" rx="10" fill="#92400e" stroke={INK} strokeWidth="4" />
          <circle cx="105" cy="365" r="76" fill="#22c55e" stroke={INK} strokeWidth="4" />
          <circle cx="52" cy="395" r="54" fill="#4ade80" stroke={INK} strokeWidth="4" />
          <circle cx="158" cy="395" r="52" fill="#4ade80" stroke={INK} strokeWidth="4" />
          {[
            [75, 340],
            [135, 352],
            [55, 402],
            [110, 408],
            [158, 396],
          ].map(([ax, ay], i) => (
            <circle key={i} cx={ax} cy={ay} r="11" fill="#ef4444" stroke={INK} strokeWidth="3" />
          ))}
        </g>
      </g>

      {/* Wooden Farm Fence */}
      <g stroke={INK} strokeWidth="3.5" fill="#d97706">
        <rect x="0" y="520" width="760" height="14" rx="4" />
        <rect x="0" y="556" width="760" height="14" rx="4" />
        {[48, 148, 248, 348, 448, 548, 648, 742].map((x) => (
          <rect key={x} x={x} y="498" width="18" height="96" rx="5" fill="#b45309" />
        ))}
      </g>

      {/* Foreground Meadow */}
      <path d="M0 582 Q420 545 840 585 Q1020 562 1200 590 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4.5" />

      {/* Sparkling Clickable Farm Pond */}
      <g
        className={`bg-clickable ${isActive('farm-pond') ? 'bg-react-splash' : ''}`}
        onClick={(e) =>
          onPropTap('farm-pond', e, {
            particles: ['💧', '💦', '🐟', '🫧'],
            label: 'Splash!',
            sound: () => soundEngine.playWaterSplash(),
          })
        }
      >
        <ellipse cx="965" cy="690" rx="165" ry="58" fill="#38bdf8" stroke={INK} strokeWidth="4" />
        <ellipse className="bg-ripple" cx="965" cy="688" rx="95" ry="22" fill="none" stroke="#e0f2fe" strokeWidth="4" />
      </g>

      {/* Swaying Clickable Wildflowers & Daisies */}
      {[
        { x: 64, y: 740, c: '#fb7185' },
        { x: 118, y: 760, c: '#facc15' },
        { x: 210, y: 752, c: '#c084fc' },
        { x: 740, y: 745, c: '#fb7185' },
        { x: 790, y: 764, c: '#ffffff' },
      ].map((f, i) => (
        <g key={i} className="bg-sway-slow" style={{ transformOrigin: `${f.x}px ${f.y + 20}px`, animationDelay: `${i * 0.3}s` }}>
          <g
            className={`bg-clickable ${isActive(`farm-flower-${i}`) ? 'bg-react-boing' : ''}`}
            onClick={(e) =>
              onPropTap(`farm-flower-${i}`, e, {
                particles: ['🌸', '🌼', '✨', '🍀'],
                label: 'Bloom!',
                sound: () => soundEngine.playFlowerPluck(i),
              })
            }
          >
            <circle cx={f.x} cy={f.y - 2} r="28" fill="transparent" />
            <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 24} stroke="#15803d" strokeWidth="4" />
            <circle cx={f.x - 8} cy={f.y - 4} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x + 8} cy={f.y - 4} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y - 11} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y + 3} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y - 4} r="5.5" fill="#fde047" stroke={INK} strokeWidth="2" />
          </g>
        </g>
      ))}

      {/* Buzzing Clickable Cartoon Bumblebee */}
      <g transform="translate(690, 215)">
        <g className="bg-bee-zip">
          <g
            className={`bg-clickable ${isActive('bee') ? 'bg-react-flutter' : ''}`}
            onClick={(e) =>
              onPropTap('bee', e, {
                particles: ['🐝', '🍯', '💛', '✨'],
                label: 'Bzzzz!',
                sound: () => soundEngine.playBeeBuzz(),
              })
            }
          >
            <circle cx="0" cy="0" r="36" fill="transparent" />
            <ellipse cx="-6" cy="-14" rx="10" ry="7" fill="#e0f2fe" stroke={INK} strokeWidth="2.5" opacity="0.9" />
            <ellipse cx="6" cy="-14" rx="10" ry="7" fill="#e0f2fe" stroke={INK} strokeWidth="2.5" opacity="0.9" />
            <ellipse cx="0" cy="0" rx="18" ry="13" fill="#facc15" stroke={INK} strokeWidth="3" />
            <line x1="-5" y1="-12" x2="-5" y2="12" stroke={INK} strokeWidth="4" />
            <line x1="5" y1="-12" x2="5" y2="12" stroke={INK} strokeWidth="4" />
            <circle cx="-10" cy="-2" r="2.5" fill={INK} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** 3. JJ & Mikey — Animated Cartoon Adventure Park (Flying Airplane, Hot-Air Balloons & Rainbow!) */
function AdventureParkSvg({ isActive, onPropTap }: SceneProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="advSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#advSky)" />

      {/* Big Clickable Shimmering Rainbow Arch */}
      <g
        className={`bg-clickable bg-sun-pulse ${isActive('adv-rainbow') ? 'bg-react-glow' : ''}`}
        opacity="0.65"
        onClick={(e) =>
          onPropTap('adv-rainbow', e, {
            particles: ['🌈', '✨', '⭐', '💖'],
            label: 'Rainbow!',
            sound: () => soundEngine.playRainbowGliss(),
          })
        }
      >
        <path d="M120 590 A480 480 0 0 1 1080 590" fill="none" stroke="#fb7185" strokeWidth="26" />
        <path d="M146 590 A454 454 0 0 1 1054 590" fill="none" stroke="#fb923c" strokeWidth="26" />
        <path d="M172 590 A428 428 0 0 1 1028 590" fill="none" stroke="#facc15" strokeWidth="26" />
        <path d="M198 590 A402 402 0 0 1 1002 590" fill="none" stroke="#4ade80" strokeWidth="26" />
        <path d="M224 590 A376 376 0 0 1 976 590" fill="none" stroke="#38bdf8" strokeWidth="26" />
      </g>

      {/* Flying Clickable Cartoon Adventure Airplane (nod to JJ & Mikey airport!) */}
      <g className="bg-plane-fly">
        <g transform="translate(0, 145)">
          <g
            className={`bg-clickable ${isActive('plane') ? 'bg-react-boing' : ''}`}
            onClick={(e) =>
              onPropTap('plane', e, {
                particles: ['✈️', '💨', '⭐', '☁️'],
                label: 'Zoom!!',
                sound: () => soundEngine.playPlaneZoom(),
              })
            }
          >
            <rect x="0" y="-22" width="195" height="72" fill="transparent" />
            <ellipse cx="42" cy="14" rx="22" ry="8" fill="#ffffff" opacity="0.7" />
            <ellipse cx="14" cy="14" rx="14" ry="6" fill="#ffffff" opacity="0.5" />
            <path d="M74 14 Q112 -4 166 10 Q182 14 166 24 L84 26 Z" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
            <path d="M110 12 L138 -10 L146 12 Z" fill="#ef4444" stroke={INK} strokeWidth="3" />
            <path d="M112 22 L134 38 L146 22 Z" fill="#38bdf8" stroke={INK} strokeWidth="3" />
            <path d="M76 14 L64 -6 L86 8 Z" fill="#ef4444" stroke={INK} strokeWidth="3" />
            <circle cx="148" cy="14" r="5" fill="#38bdf8" stroke={INK} strokeWidth="2" />
            <circle cx="132" cy="14" r="4" fill="#38bdf8" stroke={INK} strokeWidth="2" />
          </g>
        </g>
      </g>

      {/* Bobbing Clickable Hot-Air Balloons */}
      <g transform="translate(650, 215)">
        <g className="bg-balloon-bob">
          <g
            className={`bg-clickable ${isActive('balloon-1') ? 'bg-react-float-up' : ''}`}
            onClick={(e) =>
              onPropTap('balloon-1', e, {
                particles: ['🎈', '✨', '🎉', '⭐'],
                label: 'Up, up!',
                sound: () => soundEngine.playBalloonBoing(),
              })
            }
          >
            <line x1="-10" y1="36" x2="-7" y2="54" stroke={INK} strokeWidth="2.5" />
            <line x1="10" y1="36" x2="7" y2="54" stroke={INK} strokeWidth="2.5" />
            <rect x="-12" y="54" width="24" height="18" rx="4" fill="#b45309" stroke={INK} strokeWidth="3" />
            <circle cx="0" cy="0" r="38" fill="#f43f5e" stroke={INK} strokeWidth="4" />
            <path d="M0 -38 Q16 0 0 38 Q-16 0 0 -38 Z" fill="#facc15" stroke={INK} strokeWidth="3" />
          </g>
        </g>
      </g>
      <g transform="translate(960, 175)">
        <g className="bg-balloon-bob" style={{ animationDelay: '-1.8s' }}>
          <g
            className={`bg-clickable ${isActive('balloon-2') ? 'bg-react-float-up' : ''}`}
            onClick={(e) =>
              onPropTap('balloon-2', e, {
                particles: ['🎈', '💜', '✨', '⭐'],
                label: 'Wheee!',
                sound: () => soundEngine.playBalloonBoing(),
              })
            }
          >
            <line x1="-8" y1="28" x2="-6" y2="42" stroke={INK} strokeWidth="2.5" />
            <line x1="8" y1="28" x2="6" y2="42" stroke={INK} strokeWidth="2.5" />
            <rect x="-10" y="42" width="20" height="14" rx="4" fill="#b45309" stroke={INK} strokeWidth="3" />
            <circle cx="0" cy="0" r="30" fill="#a855f7" stroke={INK} strokeWidth="3.5" />
            <path d="M0 -30 Q12 0 0 30 Q-12 0 0 -30 Z" fill="#38bdf8" stroke={INK} strokeWidth="2.5" />
          </g>
        </g>
      </g>

      {/* Drifting Clickable Blocky-Cartoon Clouds */}
      <g className="bg-cloud-drift" fill="#ffffff" stroke={INK} strokeWidth="3.5" opacity="0.95">
        <g
          className={`bg-clickable ${isActive('adv-cloud-1') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('adv-cloud-1', e, {
              particles: ['☁️', '✨', '⭐', '💧'],
              label: 'Boing!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <rect x="120" y="102" width="128" height="44" rx="16" />
          <rect x="152" y="80" width="68" height="36" rx="14" />
        </g>
        <g
          className={`bg-clickable ${isActive('adv-cloud-2') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('adv-cloud-2', e, {
              particles: ['☁️', '✨', '⭐', '💧'],
              label: 'Poof!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <rect x="780" y="96" width="136" height="46" rx="16" />
          <rect x="814" y="74" width="72" height="36" rx="14" />
        </g>
      </g>

      {/* Adventure Hills & Clickable Blocky-Cartoon Trees */}
      <path d="M0 545 Q340 450 680 535 Q960 465 1200 535 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />
      {[68, 220, 1060].map((x, idx) => (
        <g key={x} className="bg-sway-slow" style={{ transformOrigin: `${x + 44}px 580px`, animationDelay: `${idx * 0.4}s` }}>
          <g transform={`translate(${x}, ${idx === 1 ? 455 : 420})`}>
            <g
              className={`bg-clickable ${isActive(`adv-tree-${idx}`) ? 'bg-react-shake' : ''}`}
              onClick={(e) =>
                onPropTap(`adv-tree-${idx}`, e, {
                  particles: ['🍃', '⭐', '🟩', '✨'],
                  label: 'Bonk!',
                  sound: () => soundEngine.playWoodMarimba(idx + 1),
                })
              }
            >
              <rect x="30" y="74" width="28" height="90" rx="6" fill="#92400e" stroke={INK} strokeWidth="4" />
              <rect x="0" y="10" width="88" height="72" rx="18" fill="#22c55e" stroke={INK} strokeWidth="4" />
              <rect x="18" y="-14" width="52" height="36" rx="12" fill="#4ade80" stroke={INK} strokeWidth="4" />
            </g>
          </g>
        </g>
      ))}
      <path d="M0 605 Q420 555 860 615 Q1050 585 1200 615 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4.5" />

      {/* Floating Clickable Glowing Star Block */}
      <g transform="translate(520, 445)">
        <g className="bg-balloon-bob">
          <g
            className={`bg-clickable ${isActive('star-block') ? 'bg-react-block-bump' : ''}`}
            onClick={(e) =>
              onPropTap('star-block', e, {
                particles: ['⭐', '🪙', '✨', '🌟'],
                label: 'Ding!!',
                sound: () => soundEngine.playStarCoin(),
              })
            }
          >
            <rect x="-12" y="-12" width="68" height="68" fill="transparent" />
            <rect x="0" y="0" width="44" height="44" rx="10" fill="#facc15" stroke={INK} strokeWidth="3.5" />
            <text x="10" y="31" fontSize="24">⭐</text>
          </g>
        </g>
      </g>
    </svg>
  );
}

/** 4. Pop-Star Trio — Animated K-Pop Rainbow Concert Stage (Sweeping Spotlights & Playable Equalizer!) */
function PopConcertStageSvg({ isActive, onPropTap }: SceneProps) {
  const eqHeights = [70, 120, 95, 145, 110, 80, 135, 155, 100, 130, 85, 140, 105, 75];
  const eqColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7', '#ec4899'];

  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="popSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="45%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#popSky)" />

      {/* Sweeping Animated Clickable Concert Spotlights */}
      <g className="bg-spotlight-left" style={{ transformOrigin: '140px 0px' }}>
        <polygon
          className={`bg-clickable ${isActive('pop-spot-0') ? 'bg-react-glow' : ''}`}
          points="140,0 500,800 40,800"
          fill="#fde047"
          opacity="0.24"
          onClick={(e) =>
            onPropTap('pop-spot-0', e, {
              particles: ['✨', '🌟', '💛', '🎵'],
              label: 'Flash!',
              sound: () => soundEngine.playPopSparkle(0),
            })
          }
        />
      </g>
      <g className="bg-spotlight-right" style={{ transformOrigin: '1060px 0px' }}>
        <polygon
          className={`bg-clickable ${isActive('pop-spot-1') ? 'bg-react-glow' : ''}`}
          points="1060,0 1160,800 700,800"
          fill="#38bdf8"
          opacity="0.26"
          onClick={(e) =>
            onPropTap('pop-spot-1', e, {
              particles: ['✨', '💙', '🌟', '🎶'],
              label: 'Shine!',
              sound: () => soundEngine.playPopSparkle(1),
            })
          }
        />
      </g>
      <g className="bg-spotlight-left" style={{ transformOrigin: '600px 0px', animationDelay: '-2s' }}>
        <polygon
          className={`bg-clickable ${isActive('pop-spot-2') ? 'bg-react-glow' : ''}`}
          points="600,0 820,800 380,800"
          fill="#ffffff"
          opacity="0.2"
          onClick={(e) =>
            onPropTap('pop-spot-2', e, {
              particles: ['✨', '💖', '⭐', '🎤'],
              label: 'Sparkle!',
              sound: () => soundEngine.playPopSparkle(2),
            })
          }
        />
      </g>

      {/* Glowing Clickable Rainbow Stage Arch */}
      <g
        className={`bg-clickable ${isActive('pop-arch') ? 'bg-react-glow' : ''}`}
        onClick={(e) =>
          onPropTap('pop-arch', e, {
            particles: ['🌈', '🎤', '✨', '💖'],
            label: 'Groovy!',
            sound: () => soundEngine.playRainbowGliss(),
          })
        }
      >
        <path d="M180 620 A420 420 0 0 1 1020 620" fill="none" stroke="#f472b6" strokeWidth="28" opacity="0.7" />
        <path d="M208 620 A392 392 0 0 1 992 620" fill="none" stroke="#fde047" strokeWidth="28" opacity="0.78" />
        <path d="M236 620 A364 364 0 0 1 964 620" fill="none" stroke="#5eead4" strokeWidth="28" opacity="0.78" />
      </g>

      {/* Playable Pulsing Rainbow Equalizer Bars synced to the Pop Beat */}
      <g opacity="0.86">
        {eqHeights.map((h, i) => (
          <rect
            key={i}
            className={`bg-clickable bg-eq-pulse ${isActive(`pop-eq-${i}`) ? 'bg-react-eq-jump' : ''}`}
            x={95 + i * 74}
            y={640 - h}
            width="44"
            height={h}
            rx="10"
            fill={eqColors[i % eqColors.length]}
            stroke={INK}
            strokeWidth="3"
            style={{
              transformOrigin: `${95 + i * 74 + 22}px 640px`,
              animationDelay: `${(i % 5) * 0.12}s`,
            }}
            onClick={(e) =>
              onPropTap(`pop-eq-${i}`, e, {
                particles: ['🎵', '🎶', '✨', '⭐'],
                sound: () => soundEngine.playEqualizerNote(i),
                durationMs: 420,
              })
            }
          />
        ))}
      </g>

      {/* Twinkling Clickable Bokeh & Stage Stars */}
      {[
        [150, 170, 18, '#fef08a'],
        [340, 120, 12, '#ffffff'],
        [600, 105, 22, '#fef08a'],
        [890, 155, 16, '#fbcfe8'],
        [1060, 210, 18, '#a5f3fc'],
      ].map(([cx, cy, r, fill], idx) => (
        <g
          key={idx}
          className={`bg-clickable ${isActive(`pop-star-${idx}`) ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap(`pop-star-${idx}`, e, {
              particles: ['⭐', '✨', '💖', '🌟'],
              label: 'Twinkle!',
              sound: () => soundEngine.playStarCoin(),
            })
          }
        >
          <circle cx={cx as number} cy={cy as number} r="34" fill="transparent" />
          <circle
            className="bg-twinkle"
            cx={cx as number}
            cy={cy as number}
            r={r as number}
            fill={fill as string}
            style={{ animationDelay: `${idx * 0.4}s` }}
          />
        </g>
      ))}

      {/* Glossy Concert Stage Floor */}
      <ellipse cx="600" cy="755" rx="740" ry="185" fill="#ec4899" stroke={INK} strokeWidth="4.5" />
      <ellipse cx="600" cy="768" rx="580" ry="130" fill="#f9a8d4" />
    </svg>
  );
}

/** 5a. Home Screen — Animated Rainbow Meadow with Sunburst, Drifting Clouds & Wildflowers */
function HomeMeadowSvg({ isActive, onPropTap }: SceneProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="homeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#homeSky)" />

      {/* Slowly Rotating Rainbow Sunbeams */}
      <g transform="translate(600, 420)" style={{ pointerEvents: 'none' }}>
        <g className="bg-sun-spin" opacity="0.22">
          {Array.from({ length: 12 }).map((_, i) => (
            <polygon
              key={i}
              points="0,0 -80,-780 80,-780"
              fill={i % 2 === 0 ? '#ffffff' : '#fef08a'}
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>
      </g>

      {/* Big Cheerful Clickable Rainbow Arch */}
      <g
        className={`bg-clickable ${isActive('home-rainbow') ? 'bg-react-glow' : ''}`}
        opacity="0.82"
        onClick={(e) =>
          onPropTap('home-rainbow', e, {
            particles: ['🌈', '✨', '💖', '⭐'],
            label: 'Rainbow!',
            sound: () => soundEngine.playRainbowGliss(),
          })
        }
      >
        <path d="M160 640 A440 440 0 0 1 1040 640" fill="none" stroke="#fb7185" strokeWidth="26" />
        <path d="M186 640 A414 414 0 0 1 1014 640" fill="none" stroke="#fb923c" strokeWidth="26" />
        <path d="M212 640 A388 388 0 0 1 988 640" fill="none" stroke="#facc15" strokeWidth="26" />
        <path d="M238 640 A362 362 0 0 1 962 640" fill="none" stroke="#4ade80" strokeWidth="26" />
        <path d="M264 640 A336 336 0 0 1 936 640" fill="none" stroke="#38bdf8" strokeWidth="26" />
        <path d="M290 640 A310 310 0 0 1 910 640" fill="none" stroke="#a855f7" strokeWidth="26" />
      </g>

      {/* Drifting Clickable Clouds */}
      <g className="bg-cloud-drift" fill="#ffffff" opacity="0.94">
        <g
          className={`bg-clickable ${isActive('home-cloud-1') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('home-cloud-1', e, {
              particles: ['☁️', '✨', '🌈', '💧'],
              label: 'Fluffy!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="180" cy="145" rx="88" ry="34" />
          <ellipse cx="242" cy="126" rx="60" ry="34" />
        </g>
        <g
          className={`bg-clickable ${isActive('home-cloud-2') ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap('home-cloud-2', e, {
              particles: ['☁️', '✨', '🌈', '💧'],
              label: 'Poof!',
              sound: () => soundEngine.playCloudPuff(),
            })
          }
        >
          <ellipse cx="960" cy="180" rx="92" ry="34" />
          <ellipse cx="1025" cy="160" rx="62" ry="34" />
        </g>
      </g>

      {/* Twinkling Clickable Sky Stars */}
      {[
        [130, 240],
        [340, 120],
        [860, 115],
        [1080, 260],
      ].map(([x, y], i) => (
        <g
          key={i}
          className={`bg-clickable ${isActive(`home-star-${i}`) ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap(`home-star-${i}`, e, {
              particles: ['⭐', '✨', '💛', '🌟'],
              label: 'Twinkle!',
              sound: () => soundEngine.playStarCoin(),
            })
          }
        >
          <circle cx={x} cy={y} r="30" fill="transparent" />
          <circle className="bg-twinkle" cx={x} cy={y} r="9" fill="#fef08a" style={{ animationDelay: `${i * 0.45}s` }} />
        </g>
      ))}

      {/* Rolling Sunny Meadow Hills */}
      <path d="M0 570 Q300 495 600 560 Q920 490 1200 565 L1200 800 L0 800 Z" fill="#86efac" stroke={INK} strokeWidth="4" />
      <path d="M0 635 Q360 580 740 635 Q1000 595 1200 635 L1200 800 L0 800 Z" fill="#4ade80" stroke={INK} strokeWidth="4.5" />

      {/* Clickable Meadow Wildflowers */}
      {[
        { x: 70, y: 655, c: '#fb7185' },
        { x: 150, y: 690, c: '#facc15' },
        { x: 1055, y: 675, c: '#c084fc' },
        { x: 1130, y: 650, c: '#fb7185' },
      ].map((f, i) => (
        <g key={i} className="bg-sway-slow" style={{ transformOrigin: `${f.x}px ${f.y + 18}px`, animationDelay: `${i * 0.35}s` }}>
          <g
            className={`bg-clickable ${isActive(`home-flower-${i}`) ? 'bg-react-boing' : ''}`}
            onClick={(e) =>
              onPropTap(`home-flower-${i}`, e, {
                particles: ['🌸', '🌼', '✨', '🍀'],
                label: 'Bloom!',
                sound: () => soundEngine.playFlowerPluck(i),
              })
            }
          >
            <circle cx={f.x} cy={f.y} r="28" fill="transparent" />
            <circle cx={f.x - 8} cy={f.y} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x + 8} cy={f.y} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y - 8} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y + 8} r="7" fill={f.c} stroke={INK} strokeWidth="2" />
            <circle cx={f.x} cy={f.y} r="5.5" fill="#fde047" stroke={INK} strokeWidth="2" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** 5b. Win Screen — Animated Rainbow Concert Finale with Sweeping Spotlights & Playable Equalizer Bars */
function WinConcertSvg({ isActive, onPropTap }: SceneProps) {
  const eqHeights = [95, 155, 120, 175, 130, 100, 160, 180, 125, 155, 105, 170, 135, 95];
  const eqColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#f472b6'];

  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="48%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#winSky)" />

      {/* Sweeping Clickable Rainbow Spotlights */}
      <g className="bg-spotlight-left" style={{ transformOrigin: '90px 0px' }}>
        <polygon
          className={`bg-clickable ${isActive('win-spot-0') ? 'bg-react-glow' : ''}`}
          points="90,0 440,800 0,800"
          fill="#f43f5e"
          opacity="0.3"
          onClick={(e) =>
            onPropTap('win-spot-0', e, {
              particles: ['🎉', '💖', '✨', '⭐'],
              label: 'Party!',
              sound: () => soundEngine.playPopSparkle(0),
            })
          }
        />
      </g>
      <g className="bg-spotlight-right" style={{ transformOrigin: '320px 0px' }}>
        <polygon
          className={`bg-clickable ${isActive('win-spot-1') ? 'bg-react-glow' : ''}`}
          points="320,0 620,800 160,800"
          fill="#4ade80"
          opacity="0.24"
          onClick={(e) =>
            onPropTap('win-spot-1', e, {
              particles: ['🎉', '💚', '✨', '🌟'],
              label: 'Woohoo!',
              sound: () => soundEngine.playPopSparkle(1),
            })
          }
        />
      </g>
      <g className="bg-spotlight-left" style={{ transformOrigin: '880px 0px', animationDelay: '-1.5s' }}>
        <polygon
          className={`bg-clickable ${isActive('win-spot-2') ? 'bg-react-glow' : ''}`}
          points="880,0 1060,800 580,800"
          fill="#facc15"
          opacity="0.26"
          onClick={(e) =>
            onPropTap('win-spot-2', e, {
              particles: ['🎉', '💛', '⭐', '✨'],
              label: 'Super!',
              sound: () => soundEngine.playPopSparkle(2),
            })
          }
        />
      </g>
      <g className="bg-spotlight-right" style={{ transformOrigin: '1120px 0px', animationDelay: '-0.8s' }}>
        <polygon
          className={`bg-clickable ${isActive('win-spot-3') ? 'bg-react-glow' : ''}`}
          points="1120,0 1200,800 780,800"
          fill="#38bdf8"
          opacity="0.3"
          onClick={(e) =>
            onPropTap('win-spot-3', e, {
              particles: ['🎉', '💙', '✨', '🎊'],
              label: 'Encore!',
              sound: () => soundEngine.playPopSparkle(0),
            })
          }
        />
      </g>

      {/* Playable Pulsing Rainbow Equalizer Bars */}
      <g opacity="0.78">
        {eqHeights.map((h, i) => (
          <rect
            key={i}
            className={`bg-clickable bg-eq-pulse ${isActive(`win-eq-${i}`) ? 'bg-react-eq-jump' : ''}`}
            x={88 + i * 74}
            y={615 - h}
            width="46"
            height={h}
            rx="10"
            fill={eqColors[i % eqColors.length]}
            stroke={INK}
            strokeWidth="3"
            style={{
              transformOrigin: `${88 + i * 74 + 23}px 615px`,
              animationDelay: `${(i % 6) * 0.1}s`,
            }}
            onClick={(e) =>
              onPropTap(`win-eq-${i}`, e, {
                particles: ['🎵', '🎶', '🎉', '✨'],
                sound: () => soundEngine.playEqualizerNote(i),
                durationMs: 420,
              })
            }
          />
        ))}
      </g>

      {/* Twinkling Clickable Bokeh Orbs */}
      {[
        [140, 210, 20, '#f472b6'],
        [280, 140, 14, '#fde047'],
        [920, 150, 18, '#38bdf8'],
        [1070, 240, 22, '#4ade80'],
        [590, 280, 16, '#ffffff'],
      ].map(([cx, cy, r, fill], idx) => (
        <g
          key={idx}
          className={`bg-clickable ${isActive(`win-orb-${idx}`) ? 'bg-react-boing' : ''}`}
          onClick={(e) =>
            onPropTap(`win-orb-${idx}`, e, {
              particles: ['🫧', '✨', '🎊', '⭐'],
              label: 'Pop!',
              sound: () => soundEngine.playBubblePop(),
            })
          }
        >
          <circle cx={cx as number} cy={cy as number} r="36" fill="transparent" />
          <circle
            className="bg-twinkle"
            cx={cx as number}
            cy={cy as number}
            r={r as number}
            fill={fill as string}
            opacity="0.75"
            style={{ animationDelay: `${idx * 0.35}s` }}
          />
        </g>
      ))}

      {/* Glowing Concert Victory Stage */}
      <ellipse cx="600" cy="730" rx="760" ry="170" fill="#38bdf8" stroke={INK} strokeWidth="4.5" />
      <ellipse cx="600" cy="742" rx="600" ry="125" fill="#bae6fd" opacity="0.88" />
    </svg>
  );
}

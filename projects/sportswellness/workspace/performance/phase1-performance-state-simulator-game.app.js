const { useState, useEffect, useCallback, useRef } = React;

function IconBase({ size = 18, className = '', viewBox = '0 0 24 24', children, fill = 'none' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Activity(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 13 7 13 10 7 14 17 17 11 21 11"></polyline>
    </IconBase>
  );
}

function Wind(props) {
  return (
    <IconBase {...props}>
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5"></path>
      <path d="M3 12h14a2 2 0 1 1-2 2"></path>
      <path d="M3 16h8a2.5 2.5 0 1 1-2.5 2.5"></path>
    </IconBase>
  );
}

function Flame(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3c1 3-1.5 4.5-1.5 6.6A3.5 3.5 0 0 0 14 13c2.2 0 4-1.8 4-4 0-3-2.1-4.8-4.7-6 1.2 2.4-.7 4-2.3 4.7C11.3 6.1 11.8 4.7 12 3Z"></path>
      <path d="M8 14a4 4 0 0 0 8 0c0-1.4-.7-2.4-1.7-3.4.1 2-1.1 3.1-2.3 3.1-1 0-1.8-.7-1.8-1.8 0-.7.2-1.1.6-1.7C9.1 11.1 8 12.3 8 14Z"></path>
    </IconBase>
  );
}

function Target(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9"></circle>
      <circle cx="12" cy="12" r="5"></circle>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
    </IconBase>
  );
}

function Crosshair(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8"></circle>
      <line x1="12" y1="4" x2="12" y2="8"></line>
      <line x1="12" y1="16" x2="12" y2="20"></line>
      <line x1="4" y1="12" x2="8" y2="12"></line>
      <line x1="16" y1="12" x2="20" y2="12"></line>
    </IconBase>
  );
}

function BrainCircuit(props) {
  return (
    <IconBase {...props}>
      <path d="M9 7a3 3 0 0 0-3 3v1.2A2.8 2.8 0 0 0 4 14v1a3 3 0 0 0 3 3h1v-2H7a1 1 0 0 1-1-1v-1.2a1 1 0 0 1 .6-1"></path>
      <path d="M15 7a3 3 0 0 1 3 3v1.2a2.8 2.8 0 0 1 2 2.8v1a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-1.2a1 1 0 0 0-.6-1"></path>
      <path d="M9 7a3 3 0 0 1 6 0v10a3 3 0 0 1-6 0Z"></path>
      <path d="M9 11h6"></path>
      <path d="M12 7v10"></path>
    </IconBase>
  );
}

function Timer(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="13" r="8"></circle>
      <path d="M12 9v4l2.5 1.5"></path>
      <path d="M9 3h6"></path>
    </IconBase>
  );
}

function AlertTriangle(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3 2.8 19h18.4L12 3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="16.5" x2="12.01" y2="16.5"></line>
    </IconBase>
  );
}

const MAX_AROUSAL = 100;
const MIN_AROUSAL = 0;
const TARGET_SPEED = 3.5;
const LOCK_RADIUS = 40;
const ARENA_SIZE = { w: 800, h: 500 };

function PerformanceStateStimulatorGame() {
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [arousal, setArousal] = useState(50);
  const [trackingPct, setTrackingPct] = useState(100);
  const [pace, setPace] = useState('steady');
  const [isLocked, setIsLocked] = useState(true);
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [cooldowns, setCooldowns] = useState({ breathe: 0, activate: 0 });

  const loopRef = useRef(null);
  const timeRef = useRef(0);
  const scoreRef = useRef(0);
  const arousalRef = useRef(50);
  const lockFramesRef = useRef(100);
  const paceRef = useRef('steady');
  const paceTimerRef = useRef(4000);
  const mouseRef = useRef({ x: ARENA_SIZE.w / 2, y: ARENA_SIZE.h / 2 });
  const reticleRef = useRef({ x: ARENA_SIZE.w / 2, y: ARENA_SIZE.h / 2 });
  const targetRef = useRef({ x: ARENA_SIZE.w / 2, y: ARENA_SIZE.h / 2, vx: TARGET_SPEED, vy: TARGET_SPEED });
  const cdRef = useRef({ breathe: 0, activate: 0 });
  const audioCtxRef = useRef(null);

  useEffect(() => {
    arousalRef.current = arousal;
  }, [arousal]);

  const playSound = useCallback((type) => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextCtor();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'breathe') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'activate') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'lock_lost') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'shift') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const handleKeyDown = (event) => {
      const now = Date.now();

      if (event.code === 'Space') {
        event.preventDefault();
        if (now - cdRef.current.breathe > 1000) {
          cdRef.current.breathe = now;
          setCooldowns((current) => ({ ...current, breathe: 1000 }));
          arousalRef.current = Math.max(MIN_AROUSAL, arousalRef.current - 15);
          playSound('breathe');
        }
      }

      if (event.code === 'KeyW' || event.key === 'w') {
        if (now - cdRef.current.activate > 1000) {
          cdRef.current.activate = now;
          setCooldowns((current) => ({ ...current, activate: 1000 }));
          arousalRef.current = Math.min(MAX_AROUSAL, arousalRef.current + 15);
          playSound('activate');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playSound]);

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const interval = setInterval(() => {
      setCooldowns({
        breathe: Math.max(0, 1000 - (Date.now() - cdRef.current.breathe)),
        activate: Math.max(0, 1000 - (Date.now() - cdRef.current.activate))
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  const endGame = useCallback((reason) => {
    setGameState('gameover');
    setCauseOfDeath(reason);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      cancelAnimationFrame(loopRef.current);
      return undefined;
    }

    let lastTime = performance.now();

    const update = (time) => {
      const dt = (time - lastTime) / 16.66;
      lastTime = time;

      timeRef.current += (16.66 * dt) / 1000;

      paceTimerRef.current -= 16.66 * dt;
      if (paceTimerRef.current <= 0) {
        const paces = ['high', 'lull', 'steady'];
        let nextPace = paces[Math.floor(Math.random() * paces.length)];
        if (nextPace === paceRef.current) {
          nextPace = 'steady';
        }

        paceRef.current = nextPace;
        setPace(nextPace);
        paceTimerRef.current = 4000 + Math.random() * 4000;
        playSound('shift');
      }

      let currentDriftRate = 0.05;
      let speedMod = 1.0;

      if (paceRef.current === 'high') {
        currentDriftRate = 0.15;
        speedMod = 1.8;
      } else if (paceRef.current === 'lull') {
        currentDriftRate = -0.15;
        speedMod = 0.4;
      }

      arousalRef.current += currentDriftRate * dt;
      const currentArousal = arousalRef.current;

      if (currentArousal >= MAX_AROUSAL) {
        endGame('Catastrophe Phenomenon (Panic / Cognitive Overload)');
        return;
      }

      if (currentArousal <= MIN_AROUSAL) {
        endGame('Total Disengagement (Complete Apathy)');
        return;
      }

      const target = targetRef.current;
      target.x += target.vx * speedMod * dt;
      target.y += target.vy * speedMod * dt;

      if (Math.random() < 0.02) {
        const angle = Math.atan2(target.vy, target.vx) + (Math.random() - 0.5) * 1.5;
        target.vx = Math.cos(angle) * TARGET_SPEED;
        target.vy = Math.sin(angle) * TARGET_SPEED;
      }

      if (target.x < 30 || target.x > ARENA_SIZE.w - 30) target.vx *= -1;
      if (target.y < 30 || target.y > ARENA_SIZE.h - 30) target.vy *= -1;

      const mouse = mouseRef.current;
      const reticle = reticleRef.current;

      let lerpFactor = 0.5;
      let jitter = 0;

      if (currentArousal < 35) {
        lerpFactor = 0.02 + ((currentArousal / 35) * 0.08);
      } else if (currentArousal <= 65) {
        lerpFactor = 0.6;
      } else {
        lerpFactor = 0.8;
        const panicScale = (currentArousal - 65) / 35;
        jitter = panicScale * 25;
      }

      reticle.x += (mouse.x - reticle.x) * lerpFactor * dt;
      reticle.y += (mouse.y - reticle.y) * lerpFactor * dt;

      if (jitter > 0) {
        reticle.x += (Math.random() - 0.5) * jitter * 2 * dt;
        reticle.y += (Math.random() - 0.5) * jitter * 2 * dt;
      }

      const dist = Math.hypot(target.x - reticle.x, target.y - reticle.y);
      const locked = dist < LOCK_RADIUS;

      if (locked) {
        lockFramesRef.current = Math.min(100, lockFramesRef.current + 0.5 * dt);
        scoreRef.current += 1 * dt;
      } else {
        lockFramesRef.current -= 0.5 * dt;
        if (Math.random() < 0.1) {
          playSound('lock_lost');
        }
      }

      if (lockFramesRef.current <= 0) {
        endGame('Focus Lost (Failed to track execution target)');
        return;
      }

      setIsLocked(locked);
      setArousal(currentArousal);
      setTimeElapsed(timeRef.current);
      setScore(Math.floor(scoreRef.current));
      setTrackingPct(lockFramesRef.current);

      loopRef.current = requestAnimationFrame(update);
    };

    loopRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(loopRef.current);
  }, [endGame, gameState, playSound]);

  const initGame = () => {
    setScore(0);
    setTimeElapsed(0);
    setArousal(50);
    setTrackingPct(100);
    setIsLocked(true);
    setCauseOfDeath('');
    setPace('steady');

    timeRef.current = 0;
    scoreRef.current = 0;
    arousalRef.current = 50;
    lockFramesRef.current = 100;
    cdRef.current = { breathe: 0, activate: 0 };
    paceRef.current = 'steady';
    paceTimerRef.current = 4000;
    targetRef.current = {
      x: ARENA_SIZE.w / 2,
      y: ARENA_SIZE.h / 2,
      vx: TARGET_SPEED,
      vy: TARGET_SPEED
    };
    reticleRef.current = { x: ARENA_SIZE.w / 2, y: ARENA_SIZE.h / 2 };
    mouseRef.current = { x: ARENA_SIZE.w / 2, y: ARENA_SIZE.h / 2 };

    setGameState('playing');

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const handleMouseMove = (event) => {
    if (gameState !== 'playing') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * ARENA_SIZE.w;
    const y = ((event.clientY - rect.top) / rect.height) * ARENA_SIZE.h;
    mouseRef.current = { x, y };
  };

  let zoneColor = 'text-lime-400';
  let zoneBorder = 'border-lime-400';
  let zoneName = 'IDEAL PERFORMANCE STATE';
  let zoneDesc = 'Cursor 1:1. Maintain this state.';

  if (arousal < 35) {
    zoneColor = 'text-amber-400';
    zoneBorder = 'border-amber-400';
    zoneName = 'APATHY / UNDER-AROUSED';
    zoneDesc = 'Sluggish response. Need activation.';
  } else if (arousal > 65) {
    zoneColor = 'text-red-500';
    zoneBorder = 'border-red-500';
    zoneName = 'OVERLOAD / PANIC';
    zoneDesc = 'High jitter. Need regulation.';
  }

  const renderCurve = () => {
    const points = [];
    for (let x = 0; x <= 100; x += 5) {
      const y = 100 - (Math.pow(x - 50, 2) / 6.25);
      points.push(`${x},${100 - Math.max(0, y)}`);
    }
    return points.join(' ');
  };

  const currentPerfY = Math.max(0, 100 - (Math.pow(arousal - 50, 2) / 6.25));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-8 flex items-center justify-center selection:bg-lime-400 selection:text-black">
      <div className="max-w-5xl w-full bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative">
        <div className="bg-black p-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50">
          <div className="flex items-center gap-3">
            <BrainCircuit className={`${zoneColor} w-6 h-6 transition-colors duration-300`} />
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-1">Phase 1 Performance State Simulator Game</p>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                Mental <span className={`${zoneColor} transition-colors duration-300`}>Fitness</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">Inverted-U Balancer v2.0</p>
            </div>
          </div>

          {gameState === 'playing' && (
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest bg-zinc-900 px-4 py-2 border border-zinc-800 rounded">
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4">
                <span className="text-zinc-500 text-[9px] mb-1"><Timer size={10} className="inline mr-1" />Time</span>
                <span className="text-white font-bold">{timeElapsed.toFixed(1)}s</span>
              </div>
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4 pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Tracking Lock</span>
                <span className={`${trackingPct <= 30 ? 'text-red-500 animate-pulse' : 'text-lime-400'} font-bold`}>{Math.floor(trackingPct)}%</span>
              </div>
              <div className="flex flex-col items-center pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Score</span>
                <span className="text-white font-bold">{score}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row h-[650px]">
          <div className="w-full md:w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col relative overflow-hidden shrink-0">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="bg-black/50 border border-zinc-800 rounded p-3 mb-4 shadow-inner">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 flex justify-between items-center">
                  <span>Match Pace</span>
                  <AlertTriangle size={10} />
                </div>
                {pace === 'high' && <div className="text-red-500 font-bold text-xs uppercase animate-pulse">Intense (Pressure Spiking)</div>}
                {pace === 'lull' && <div className="text-amber-400 font-bold text-xs uppercase animate-pulse">Lull (Energy Dropping)</div>}
                {pace === 'steady' && <div className="text-zinc-300 font-bold text-xs uppercase">Steady (Baseline)</div>}
              </div>

              <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4">Arousal / Performance</h3>

              <div className="relative w-full aspect-square bg-zinc-900/50 border-b border-l border-zinc-700 mb-6 rounded-tr">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible p-2">
                  <rect x="35" y="0" width="30" height="100" fill="var(--performance-game-primary-soft)" />
                  <line x1="35" y1="0" x2="35" y2="100" stroke="var(--performance-game-primary-border)" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="65" y1="0" x2="65" y2="100" stroke="var(--performance-game-primary-border)" strokeWidth="0.5" strokeDasharray="2" />
                  <polyline points={renderCurve()} fill="none" stroke="var(--performance-game-line)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx={arousal} cy={100 - currentPerfY} r="4" fill="currentColor" className={`${zoneColor} transition-all duration-75`} />
                  <line x1={arousal} y1={100 - currentPerfY} x2={arousal} y2="100" stroke="currentColor" className={`${zoneColor} opacity-50 transition-all duration-75`} strokeWidth="1" strokeDasharray="1" />
                </svg>

                <div className="absolute -bottom-5 left-0 text-[8px] text-zinc-600 font-mono">Apathy</div>
                <div className="absolute -bottom-5 right-0 text-[8px] text-zinc-600 font-mono">Panic</div>
                <div className="absolute -left-6 top-0 text-[8px] text-zinc-600 font-mono -rotate-90 origin-bottom-left">Perf</div>
              </div>

              <div className={`p-3 border ${zoneBorder} bg-black/50 backdrop-blur rounded mb-auto transition-colors duration-300`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className={zoneColor} size={14} />
                  <span className={`text-[10px] font-black tracking-widest ${zoneColor}`}>{zoneName}</span>
                </div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider">{zoneDesc}</p>
                <div className="text-2xl font-black font-mono mt-2 text-white">{Math.floor(arousal)}<span className="text-zinc-500 text-sm">%</span></div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-wider">
                    <Wind size={14} /> Breathe
                  </div>
                  <div className="bg-zinc-800 text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded border border-zinc-700">SPACE</div>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-400 transition-all duration-75" style={{ width: `${100 - (cooldowns.breathe / 10)}%` }} />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Flame size={14} /> Activate
                  </div>
                  <div className="bg-zinc-800 text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded border border-zinc-700">W</div>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${100 - (cooldowns.activate / 10)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex-1 bg-zinc-950 relative overflow-hidden cursor-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 202, 0.06) 0%, rgba(15, 19, 26, 0.45) 35%, var(--performance-game-panel-alt) 78%)'
            }}
            onMouseMove={handleMouseMove}
          >
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(239, 68, 68, ${Math.max(0, (arousal - 65) / 35) * 0.5}) 100%)`
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
              style={{
                background: `rgba(245, 158, 11, ${Math.max(0, (35 - arousal) / 35) * 0.12})`
              }}
            />

            {gameState === 'playing' && (
              <>
                <div
                  className="absolute w-8 h-8 rounded-full border-2 border-white bg-white/10 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
                  style={{
                    left: `${(targetRef.current.x / ARENA_SIZE.w) * 100}%`,
                    top: `${(targetRef.current.y / ARENA_SIZE.h) * 100}%`,
                    boxShadow: isLocked ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
                    transform: `translate(-50%, -50%) scale(${pace === 'high' ? 0.7 : pace === 'lull' ? 1.4 : 1.0})`
                  }}
                >
                  <Target size={20} className="text-white/50" />
                </div>

                <div
                  className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none"
                  style={{
                    left: `${(reticleRef.current.x / ARENA_SIZE.w) * 100}%`,
                    top: `${(reticleRef.current.y / ARENA_SIZE.h) * 100}%`
                  }}
                >
                  <Crosshair className={`w-full h-full ${isLocked ? 'text-lime-400' : 'text-red-500 opacity-50'} transition-colors duration-100`} strokeWidth={1.5} />
                  {!isLocked && (
                    <div className="absolute top-14 whitespace-nowrap text-[9px] font-mono font-bold text-red-500 bg-black/80 px-2 py-0.5 rounded border border-red-500/50">
                      LOCK LOST
                    </div>
                  )}
                </div>

                <div
                  className="absolute w-2 h-2 bg-zinc-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${(mouseRef.current.x / ARENA_SIZE.w) * 100}%`,
                    top: `${(mouseRef.current.y / ARENA_SIZE.h) * 100}%`
                  }}
                />

                {arousal < 35 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <line
                      x1={`${(mouseRef.current.x / ARENA_SIZE.w) * 100}%`}
                      y1={`${(mouseRef.current.y / ARENA_SIZE.h) * 100}%`}
                      x2={`${(reticleRef.current.x / ARENA_SIZE.w) * 100}%`}
                      y2={`${(reticleRef.current.y / ARENA_SIZE.h) * 100}%`}
                      stroke="var(--performance-game-warning)"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                  </svg>
                )}
              </>
            )}

            {gameState === 'intro' && (
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center border-t-4 border-lime-400">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">The <span className="text-lime-400">Inverted-U</span> Balancer</h2>
                <p className="text-zinc-400 max-w-xl text-sm leading-relaxed mb-8">
                  Your cursor&apos;s responsiveness is governed by your Arousal. Keep it in the <strong>Ideal Performance State (IPS)</strong>.
                  <br /><br />
                  The <strong>Pace of the Match</strong> shifts dynamically. During an <span className="text-red-400 font-bold">Intense Pace</span>, the target flies and pressure builds, pushing you toward Panic. During a <span className="text-amber-400 font-bold">Lull</span>, the target crawls and boredom drags you into Apathy.
                </p>

                <div className="flex gap-8 mb-10 text-left flex-wrap justify-center">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="text-lime-400 font-bold uppercase text-xs mb-1">Tool 1: Breathing</div>
                    <div className="text-white text-sm">Press <kbd className="bg-zinc-800 px-1 rounded text-xs">SPACE</kbd></div>
                    <div className="text-zinc-500 text-[10px] uppercase mt-1">Lowers Arousal (Combats Panic)</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="text-amber-400 font-bold uppercase text-xs mb-1">Tool 2: Activation</div>
                    <div className="text-white text-sm">Press <kbd className="bg-zinc-800 px-1 rounded text-xs">W</kbd></div>
                    <div className="text-zinc-500 text-[10px] uppercase mt-1">Raises Arousal (Combats Apathy)</div>
                  </div>
                </div>

                <button
                  onClick={initGame}
                  className="bg-lime-400 hover:bg-lime-300 text-black font-black text-lg px-10 py-4 uppercase tracking-[0.2em] transition-transform hover:scale-105"
                >
                  Begin Simulation
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center border-t-4 border-red-500">
                <div className="inline-block bg-red-500 text-white px-3 py-1 text-xs font-black uppercase tracking-[0.3em] mb-6">
                  Regulation Failure
                </div>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Simulation Terminated</h2>
                <p className="text-red-400 font-mono text-sm uppercase tracking-widest mb-10 max-w-xl">
                  Cause: {causeOfDeath}
                </p>

                <div className="bg-zinc-900 border border-zinc-800 p-8 max-w-lg w-full mb-8 text-center shadow-2xl flex gap-8 justify-center">
                  <div>
                    <h3 className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest mb-2">Survival Time</h3>
                    <div className="text-4xl font-black text-white">{timeElapsed.toFixed(1)}s</div>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest mb-2">Final Score</h3>
                    <div className="text-4xl font-black text-lime-400 drop-shadow-[0_0_15px_rgba(163,230,53,0.3)]">{score}</div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 max-w-2xl w-full text-left mb-8">
                  <h3 className="text-white font-bold uppercase text-xs tracking-wider mb-4 border-b border-zinc-800 pb-2">Pedagogical Review</h3>
                  {causeOfDeath.includes('Panic') ? (
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      You failed to regulate rising arousal during an intense period of play. High arousal degrades fine motor coordination and introduces unwanted muscle tension (jitter). You must use the <strong>Breathing</strong> tool to reset the stress loop.
                    </p>
                  ) : causeOfDeath.includes('Apathy') ? (
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      You failed to activate during a lull in play. Low arousal results in sluggishness, flatness, and poor tracking. You must use <strong>Activation (Cue Words/Imagery)</strong> to lift your energy back into the Ideal Performance State when the task lacks urgency.
                    </p>
                  ) : (
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Your arousal drifted outside the Ideal Performance State (IPS) for too long, causing your execution to break down. Peak performance requires continuous monitoring and regulation of energy.
                    </p>
                  )}
                </div>

                <button
                  onClick={initGame}
                  className="bg-zinc-800 text-white hover:bg-zinc-700 font-black text-sm px-8 py-4 uppercase tracking-[0.2em] transition-all border border-zinc-700"
                >
                  Restart Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const phase1Root = document.getElementById('root');
if (phase1Root && ReactDOM.createRoot) {
  ReactDOM.createRoot(phase1Root).render(<PerformanceStateStimulatorGame />);
} else if (phase1Root) {
  ReactDOM.render(<PerformanceStateStimulatorGame />, phase1Root);
}

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

function Target(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9"></circle>
      <circle cx="12" cy="12" r="5"></circle>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
    </IconBase>
  );
}

function Activity(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 13 7 13 10 7 14 17 17 11 21 11"></polyline>
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

function Trophy(props) {
  return (
    <IconBase {...props}>
      <path d="M8 4h8v2a4 4 0 0 1-8 0V4Z"></path>
      <path d="M6 5H4a2 2 0 0 0 2 3"></path>
      <path d="M18 5h2a2 2 0 0 1-2 3"></path>
      <path d="M12 10v5"></path>
      <path d="M9 21h6"></path>
      <path d="M10 15h4l1 3H9l1-3Z"></path>
    </IconBase>
  );
}

function ShieldAlert(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"></path>
      <line x1="12" y1="8" x2="12" y2="12.5"></line>
      <line x1="12" y1="15.5" x2="12.01" y2="15.5"></line>
    </IconBase>
  );
}

function Zap(props) {
  return (
    <IconBase {...props}>
      <polygon points="13 2 5 14 11 14 9 22 19 9 13 9"></polygon>
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

const MAX_PROCESS_POINTS = 500;
const MAX_ANXIETY = 100;
const BASE_CAPACITY = 100;
const OUTCOME_ZONE_HEIGHT_PCT = 25;
const TARGET_LIFESPAN = 2500;

const EVENTS_DB = {
  mindset1: {
    title: 'Failure Processing',
    left: { id: 'm1_shame', label: 'I am deficient.', effect: '+50 Pts, Targets Shrink', color: 'red', icon: AlertTriangle },
    right: { id: 'm1_guilt', label: 'Adjust strategy.', effect: '-20 Pts, Targets Enlarge', color: 'cyan', icon: Activity }
  },
  pride: {
    title: 'Streak Attribution',
    left: { id: 'pride_hubristic', label: "I'm a natural.", effect: '+40 Pts, Targets Shrink', color: 'yellow', icon: Trophy },
    right: { id: 'pride_authentic', label: 'Process works.', effect: 'Targets Enlarge', color: 'lime', icon: Zap }
  },
  mindset2: {
    title: 'Friction Processing',
    left: { id: 'm2_shame', label: "I can't do this.", effect: 'Targets Shrink, Slower', color: 'red', icon: AlertTriangle },
    right: { id: 'm2_guilt', label: 'Focus on cues.', effect: 'Targets Enlarge, Faster', color: 'cyan', icon: Activity }
  }
};

function DisciplineArchitecture() {
  const [gameState, setGameState] = useState('intro');
  const [points, setPoints] = useState(0);
  const [anxiety, setAnxiety] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(BASE_CAPACITY);
  const [streak, setStreak] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targets, setTargets] = useState([]);
  const [targetSizeMod, setTargetSizeMod] = useState(1.0);
  const [targetLifespanMod, setTargetLifespanMod] = useState(1.0);
  const [shieldActive, setShieldActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  const triggeredQuartersRef = useRef([]);
  const loopRef = useRef(null);
  const spawnerRef = useRef(null);
  const shieldTimeoutRef = useRef(null);
  const mouseYPctRef = useRef(100);
  const anxietyRef = useRef(0);
  const pointsRef = useRef(0);
  const timeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const targetLifespanModRef = useRef(1.0);

  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { targetLifespanModRef.current = targetLifespanMod; }, [targetLifespanMod]);

  useEffect(() => () => {
    clearInterval(loopRef.current);
    clearInterval(spawnerRef.current);
    clearTimeout(shieldTimeoutRef.current);
  }, []);

  const playSound = useCallback((type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'miss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'shame') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'powerup') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  }, []);

  const spawnTarget = useCallback(() => {
    setTargets((prev) => {
      if (prev.length >= 4) return prev;

      const size = Math.max(20, 60 * targetSizeMod);
      const minX = size;
      const maxX = 100 - size;
      const minY = OUTCOME_ZONE_HEIGHT_PCT + 10;
      const maxY = 90;

      return [...prev, {
        id: Date.now() + Math.random(),
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        createdAt: Date.now(),
        size
      }];
    });
  }, [targetSizeMod]);

  const endGame = useCallback((reason) => {
    setGameState('gameover');
    setCauseOfDeath(reason);
  }, []);

  const winGame = useCallback(() => {
    setGameState('win');
    playSound('powerup');
  }, [playSound]);

  useEffect(() => {
    if (gameState !== 'playing') {
      clearInterval(loopRef.current);
      clearInterval(spawnerRef.current);
      return;
    }

    spawnerRef.current = setInterval(() => {
      spawnTarget();
    }, 800);

    loopRef.current = setInterval(() => {
      const now = Date.now();
      timeRef.current += 0.016;
      setTimeElapsed(timeRef.current);

      let missedTargetCount = 0;

      setTargets((prev) => {
        const next = prev.map((target) => {
          let nx = target.x + target.vx;
          let ny = target.y + target.vy;
          if (nx < 2 || nx > 98) target.vx *= -1;
          if (ny < OUTCOME_ZONE_HEIGHT_PCT + 5 || ny > 95) target.vy *= -1;
          return { ...target, x: nx, y: ny };
        });

        const currentLifespan = TARGET_LIFESPAN * targetLifespanModRef.current;
        const alive = next.filter((target) => now - target.createdAt < currentLifespan);
        missedTargetCount = next.length - alive.length;
        return alive;
      });

      if (missedTargetCount > 0) {
        playSound('miss');
        setPoints((value) => Math.max(0, value - (10 * missedTargetCount)));
      }

      setAnxiety((currentAnxiety) => {
        let nextAnxiety = currentAnxiety;
        if (!shieldActive) {
          if (mouseYPctRef.current < OUTCOME_ZONE_HEIGHT_PCT + 5) {
            nextAnxiety += 0.8;
          } else {
            nextAnxiety -= 0.3;
          }
        }

        const clamped = Math.max(0, Math.min(MAX_ANXIETY, nextAnxiety));
        anxietyRef.current = clamped;

        if (clamped >= MAX_ANXIETY) {
          endGame('Choking (Anxiety Overload from Outcome Trap)');
        }

        return clamped;
      });
    }, 16);

    return () => {
      clearInterval(loopRef.current);
      clearInterval(spawnerRef.current);
    };
  }, [gameState, shieldActive, spawnTarget, endGame, playSound]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const checkQuarter = (threshold, quarterNum, eventKey) => {
      if (points >= threshold && !triggeredQuartersRef.current.includes(quarterNum)) {
        triggeredQuartersRef.current.push(quarterNum);
        setActiveEvent(eventKey);
        playSound('powerup');
      }
    };

    checkQuarter(MAX_PROCESS_POINTS * 0.25, 1, 'mindset1');
    checkQuarter(MAX_PROCESS_POINTS * 0.5, 2, 'pride');
    checkQuarter(MAX_PROCESS_POINTS * 0.75, 3, 'mindset2');
  }, [points, gameState, playSound]);

  useEffect(() => {
    if (points >= MAX_PROCESS_POINTS && gameState === 'playing') {
      winGame();
    }
  }, [points, gameState, winGame]);

  const handleMouseMove = (event) => {
    if (gameState !== 'playing') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pct = ((event.clientY - rect.top) / rect.height) * 100;
    mouseYPctRef.current = pct;
  };

  const handleHitTarget = (id, event) => {
    event.stopPropagation();
    if (gameState !== 'playing') return;

    playSound('hit');
    setTargets((prev) => prev.filter((target) => target.id !== id));
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    const pointsGained = 10 + Math.floor(nextStreak * 1.5);
    setPoints((value) => Math.min(MAX_PROCESS_POINTS, value + pointsGained));
  };

  const handleMisclickArena = () => {
    if (gameState !== 'playing') return;
    playSound('miss');
    setStreak(0);
    setPoints((value) => Math.max(0, value - 5));
  };

  const showFeedbackMsg = (message, colorClass) => {
    setFeedback({ msg: message, colorClass });
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleEventChoice = (choiceId) => {
    setActiveEvent(null);

    if (choiceId === 'm1_shame') {
      playSound('shame');
      setPoints((value) => Math.min(MAX_PROCESS_POINTS, value + 50));
      setTargetSizeMod((value) => value * 0.85);
      showFeedbackMsg('SHAME: +50 Pts, Targets Shrunk', 'text-red-500');
    } else if (choiceId === 'm1_guilt') {
      playSound('powerup');
      setPoints((value) => Math.max(0, value - 20));
      setTargetSizeMod((value) => value * 1.15);
      showFeedbackMsg('GROWTH: -20 Pts, Targets Enlarged', 'text-lime-400');
    } else if (choiceId === 'pride_hubristic') {
      playSound('powerup');
      setPoints((value) => Math.min(MAX_PROCESS_POINTS, value + 40));
      setTargetSizeMod((value) => value * 0.75);
      showFeedbackMsg('HUBRIS: +40 Pts, Targets Shrunk', 'text-amber-400');
    } else if (choiceId === 'pride_authentic') {
      playSound('powerup');
      setTargetSizeMod((value) => value * 1.15);
      showFeedbackMsg('AUTHENTIC PRIDE: Targets Enlarged', 'text-lime-400');
    } else if (choiceId === 'm2_shame') {
      playSound('shame');
      setTargetSizeMod((value) => value * 0.85);
      setTargetLifespanMod((value) => value * 1.3);
      showFeedbackMsg('SHAME: Targets Shrunk, Slower', 'text-red-500');
    } else if (choiceId === 'm2_guilt') {
      playSound('powerup');
      setTargetSizeMod((value) => value * 1.15);
      setTargetLifespanMod((value) => value * 0.7);
      showFeedbackMsg('GROWTH: Targets Enlarged, Faster', 'text-lime-400');
    }
  };

  const initGame = () => {
    setPoints(0);
    setAnxiety(0);
    setMaxCapacity(BASE_CAPACITY);
    setStreak(0);
    setTimeElapsed(0);
    timeRef.current = 0;
    setTargets([]);
    setTargetSizeMod(1.0);
    setTargetLifespanMod(1.0);
    setShieldActive(false);
    setActiveEvent(null);
    setFeedback(null);
    setCauseOfDeath('');
    triggeredQuartersRef.current = [];
    mouseYPctRef.current = 100;
    anxietyRef.current = 0;
    clearTimeout(shieldTimeoutRef.current);
    setGameState('playing');

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const blurAmount = Math.max(0, (anxiety - 50) / 10);
  const desaturateAmount = anxiety;
  const isShaking = anxiety > 70 && gameState === 'playing';

  const shakeCSS = `
    @keyframes tacticalShake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    .shake-severe { animation: tacticalShake 0.2s infinite; }
  `;

  const currentEvent = activeEvent ? EVENTS_DB[activeEvent] : null;
  const LeftIcon = currentEvent?.left?.icon;
  const RightIcon = currentEvent?.right?.icon;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-8 flex items-center justify-center selection:bg-lime-400 selection:text-black">
      <style>{shakeCSS}</style>

      <div
        className={`max-w-5xl w-full bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col ${isShaking ? 'shake-severe border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : ''}`}
        onMouseMove={handleMouseMove}
      >
        <div className="bg-black p-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-lime-400 w-6 h-6" />
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-1">Phase 2 Architecture of Discipline Game</p>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                Integrated <span className="text-lime-400">Discipline</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">Execution Simulator v3.0</p>
            </div>
          </div>

          {(gameState === 'playing' || gameState === 'win') && (
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest bg-zinc-900 px-4 py-2 border border-zinc-800 rounded">
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4">
                <span className="text-zinc-500 text-[9px] mb-1"><Timer size={10} className="inline mr-1" />Time</span>
                <span className="text-white font-bold">{timeElapsed.toFixed(1)}s</span>
              </div>
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4 pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Max Capacity</span>
                <span className={`${maxCapacity <= 50 ? 'text-red-500' : 'text-lime-400'} font-bold`}>{maxCapacity}%</span>
              </div>
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4 pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Anxiety</span>
                <span className={`${anxiety > 70 ? 'text-red-500 animate-pulse' : 'text-zinc-300'} font-bold`}>{Math.floor(anxiety)}%</span>
              </div>
              <div className="flex flex-col items-center pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Streak</span>
                <span className="text-lime-400 font-bold">x{streak}</span>
              </div>
            </div>
          )}
        </div>

        <div
          className="relative min-h-[650px] w-full bg-zinc-950 overflow-hidden select-none transition-all duration-300"
          style={{ filter: gameState === 'playing' ? `blur(${blurAmount}px) grayscale(${desaturateAmount}%)` : 'none' }}
        >
          <div className="absolute top-0 left-0 w-full h-[25%] bg-gradient-to-b from-lime-400/10 to-transparent border-b border-lime-400/50 group z-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,202,0.12),transparent_70%)] pointer-events-none"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105 duration-700">
              <Trophy className={`mx-auto text-lime-400 mb-1 w-8 h-8 drop-shadow-[0_0_15px_rgba(0,255,202,0.35)] ${activeEvent ? 'opacity-20' : 'opacity-80'}`} />
              <h2 className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-lime-300 to-lime-500 uppercase tracking-tighter drop-shadow-md transition-opacity ${activeEvent ? 'opacity-20' : 'opacity-100'}`}>
                Championship Outcome
              </h2>
              <p className={`text-[9px] text-lime-400/70 font-mono uppercase tracking-[0.3em] mt-1 transition-opacity ${activeEvent ? 'opacity-0' : 'opacity-100'}`}>
                Warning: Fixation Generates Anxiety
              </p>
            </div>

            {currentEvent && LeftIcon && RightIcon && (
              <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 pointer-events-none">
                <button
                  onMouseDown={(event) => { event.stopPropagation(); handleEventChoice(currentEvent.left.id); }}
                  className="pointer-events-auto w-[40%] md:w-[30%] bg-zinc-950/90 border-2 border-zinc-800 hover:border-red-500 p-3 md:p-4 text-left transition-all shadow-xl backdrop-blur"
                >
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <LeftIcon size={14} /> Option A
                  </div>
                  <h3 className="text-sm md:text-lg font-black text-white mb-1">"{currentEvent.left.label}"</h3>
                  <div className="bg-black/80 p-1.5 text-[9px] font-mono text-zinc-400 border-l-2 border-red-500">
                    Effect: <span className="text-red-400">{currentEvent.left.effect}</span>
                  </div>
                </button>

                <button
                  onMouseDown={(event) => { event.stopPropagation(); handleEventChoice(currentEvent.right.id); }}
                  className="pointer-events-auto w-[40%] md:w-[30%] bg-zinc-950/90 border-2 border-zinc-800 hover:border-lime-400/50 p-3 md:p-4 text-left transition-all shadow-xl backdrop-blur"
                >
                  <div className="text-lime-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <RightIcon size={14} /> Option B
                  </div>
                  <h3 className="text-sm md:text-lg font-black text-white mb-1">"{currentEvent.right.label}"</h3>
                  <div className="bg-black/80 p-1.5 text-[9px] font-mono text-zinc-400 border-l-2 border-lime-400">
                    Effect: <span className="text-lime-400">{currentEvent.right.effect}</span>
                  </div>
                </button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 h-1.5 bg-lime-400/80 shadow-[0_0_10px_rgba(0,255,202,0.4)]" style={{ width: `${(points / MAX_PROCESS_POINTS) * 100}%`, transition: 'width 0.2s ease-out' }}></div>
          </div>

          <div
            className="absolute bottom-0 left-0 w-full h-[75%] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] cursor-crosshair z-10"
            onMouseDown={handleMisclickArena}
          >
            {gameState === 'playing' && targets.map((target) => {
              const currentLifespan = TARGET_LIFESPAN * targetLifespanMod;
              const age = Date.now() - target.createdAt;
              const lifePct = Math.max(0, 1 - (age / currentLifespan));

              return (
                <div
                  key={target.id}
                  onMouseDown={(event) => handleHitTarget(target.id, event)}
                  className="absolute rounded-full border-2 border-lime-400 bg-lime-400/10 flex items-center justify-center hover:bg-lime-400/20 transition-colors"
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Crosshair className="text-lime-400 w-1/2 h-1/2 pointer-events-none" />
                  <div
                    className="absolute inset-0 rounded-full border border-lime-400/50 pointer-events-none"
                    style={{ transform: `scale(${lifePct})` }}
                  ></div>
                </div>
              );
            })}

            {shieldActive && (
              <div className="absolute inset-0 border-4 border-lime-400/50 pointer-events-none bg-lime-400/10 shadow-[inset_0_0_50px_rgba(0,255,202,0.08)]">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-lime-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={14} /> Anxiety Shield Active
                </div>
              </div>
            )}
          </div>

          {feedback && (
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl font-black ${feedback.colorClass} drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] uppercase tracking-tight pointer-events-none z-50 animate-bounce whitespace-nowrap`}>
              {feedback.msg}
            </div>
          )}

          {gameState === 'intro' && (
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Mastering the <span className="text-lime-400">Arena</span></h2>
              <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed mb-8">
                Your goal is to fill the Championship Bar (500 pts) as fast as possible.
                <br /><br />
                Click the moving Process Targets to gain points. <strong>Streaks multiply your score.</strong> Clicking the background or missing targets penalizes you and breaks your streak.
                <br /><br />
                At 25%, 50%, and 75% progress, psychological choices will appear in the <strong>Outcome Zone</strong> at the top. You must quickly divert your eyes to click a choice while continuing to execute, but beware. Hovering in the Outcome Zone spikes <span className="text-red-400 font-bold">Anxiety</span>.
              </p>

              <button
                onClick={initGame}
                className="bg-lime-400 hover:bg-lime-300 text-black font-black text-lg px-10 py-4 uppercase tracking-[0.2em] flex items-center gap-3 transition-transform hover:scale-105"
              >
                Commence Execution
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center border-t-4 border-red-500">
              <div className="inline-block bg-red-500 text-white px-3 py-1 text-xs font-black uppercase tracking-[0.3em] mb-6">
                System Failure
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Simulation Terminated</h2>
              <p className="text-red-400 font-mono text-sm uppercase tracking-widest mb-10 max-w-xl">
                Cause: {causeOfDeath}
              </p>

              <div className="bg-zinc-900 border border-zinc-800 p-6 max-w-2xl w-full text-left mb-8">
                <h3 className="text-white font-bold uppercase text-xs tracking-wider mb-4 border-b border-zinc-800 pb-2">Pedagogical Review</h3>
                {causeOfDeath.includes('Anxiety') ? (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    You lingered too long in the Outcome Zone. Taking your eyes off the process to make a choice is necessary, but staring at the outcome under pressure generates performance anxiety. Make the tactical choice and immediately return to the process.
                  </p>
                ) : (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    You processed failure through identity instead of behavior. Saying "I am deficient" provides no tactical data and permanently shrinks your capacity to handle stress. Growth requires behavior-focused accountability and a next move.
                  </p>
                )}
              </div>

              <button
                onClick={initGame}
                className="bg-zinc-800 text-white hover:bg-zinc-700 font-black text-sm px-8 py-4 uppercase tracking-[0.2em] inline-flex items-center gap-3 transition-all border border-zinc-700"
              >
                Restart Simulation
              </button>
            </div>
          )}

          {gameState === 'win' && (
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center border-t-4 border-lime-400">
              <div className="inline-block bg-lime-400 text-black px-3 py-1 text-xs font-black uppercase tracking-[0.3em] mb-6">
                Mastery Achieved
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Outcome Secured</h2>
              <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest mb-10 max-w-xl leading-relaxed">
                You successfully managed dual-task anxiety and processed feedback through a growth mindset.
              </p>

              <div className="bg-zinc-900 border border-zinc-800 p-8 max-w-lg w-full mb-8 text-center shadow-2xl">
                <h3 className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest mb-2">Final Execution Time</h3>
                <div className="text-6xl font-black text-lime-400 drop-shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                  {timeElapsed.toFixed(1)}s
                </div>
              </div>

              <button
                onClick={initGame}
                className="bg-lime-400 text-black hover:bg-lime-300 font-black text-sm px-8 py-4 uppercase tracking-[0.2em] inline-flex items-center gap-3 transition-all"
              >
                Improve Time
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const rootNode = document.getElementById('root');
if (rootNode) {
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootNode).render(<DisciplineArchitecture />);
  } else {
    ReactDOM.render(<DisciplineArchitecture />, rootNode);
  }
}

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

function AlertCircle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="12" y1="8" x2="12" y2="13"></line>
      <line x1="12" y1="16.5" x2="12.01" y2="16.5"></line>
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

function Brain(props) {
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

function Activity(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 13 7 13 10 7 14 17 17 11 21 11"></polyline>
    </IconBase>
  );
}

function RotateCcw(props) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <polyline points="3 4 6 4 6 7"></polyline>
    </IconBase>
  );
}

function Play(props) {
  return (
    <IconBase {...props} fill="currentColor">
      <polygon points="8,6 18,12 8,18"></polygon>
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

const BALL_SPEED = 1.5;
const MAX_INTERFERENCE = 100;

const spawnBall = (multi = 1.0) => {
  const types = ['Short', 'Deep', 'Slice', 'Kick'];
  const type = types[Math.floor(Math.random() * types.length)];

  let hitZone = { min: 75, max: 95 };
  let vx = 1.2 * multi;
  let vy = (Math.random() - 0.5) * 0.5;
  let curve = 0;

  if (type === 'Short') {
    hitZone = { min: 40, max: 60 };
    vx = (0.8 + Math.random() * 0.6) * multi;
    vy = (Math.random() - 0.5) * 0.4;
  } else if (type === 'Deep') {
    hitZone = { min: 80, max: 95 };
    vx = (1.6 + Math.random() * 0.8) * multi;
  } else if (type === 'Slice') {
    hitZone = { min: 60, max: 85 };
    vx = (1.2 + Math.random() * 0.4) * multi;
    curve = 0.08 * (Math.random() > 0.5 ? 1 : -1) * multi;
  } else if (type === 'Kick') {
    hitZone = { min: 70, max: 90 };
    vx = (1.4 + Math.random() * 0.6) * multi;
    curve = 0.15 * (Math.random() > 0.5 ? 1 : -1) * multi;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    x: 0,
    y: Math.random() * 60 + 20,
    vx,
    vy,
    curve,
    hitZone,
    label: type
  };
};

const SELF_1_THOUGHTS = [
  'Why was that shot so bad?',
  'Bend your knees more!',
  "I'm going to double fault.",
  'They are judging my form.',
  'That was a lucky shot.',
  'My grip pressure is wrong.',
  "I shouldn't have missed that.",
  "Don't hit it into the net!",
  'My backhand is terrible today.',
  'Perfect form!',
  "I'm playing amazing today!",
  "Don't lose this lead!",
  'What a brilliant shot!'
];

function InnerGameSimulator() {
  const [gameState, setGameState] = useState('intro');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [potential, setPotential] = useState(0);
  const [interference, setInterference] = useState(0);
  const [performance, setPerformance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [hasSlowDown, setHasSlowDown] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const [ballState, setBallState] = useState(spawnBall());
  const [thoughts, setThoughts] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [canCenter, setCanCenter] = useState(true);

  const streakRef = useRef(0);
  const timeRef = useRef(0);
  const tickRef = useRef(0);
  const audioCtxRef = useRef(null);
  const isSlowedRef = useRef(false);
  const ballRef = useRef(ballState);
  const gameLoopRef = useRef(null);
  const thoughtSpawnerRef = useRef(null);

  useEffect(() => {
    isSlowedRef.current = isSlowed;
  }, [isSlowed]);

  useEffect(() => {
    ballRef.current = ballState;
  }, [ballState]);

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

    if (type === 'bounce') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'slow') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  }, []);

  const getDifficulty = (time) => {
    if (time < 30) return { stage: 'Cognitive', multi: 0.75 };
    if (time < 60) return { stage: 'Associative', multi: 1.0 };
    if (time < 120) return { stage: 'Autonomous', multi: 1.25 };
    return { stage: 'Mastery', multi: 1.5 };
  };

  const updateStreak = useCallback((val) => {
    streakRef.current = typeof val === 'function' ? val(streakRef.current) : val;
    setStreak(streakRef.current);
  }, []);

  useEffect(() => {
    const calculatedPerformance = Math.max(0, potential - Math.floor(interference));
    setPerformance(calculatedPerformance);
  }, [potential, interference]);

  const showFeedback = useCallback((message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 1500);
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameover');
    clearInterval(gameLoopRef.current);
    clearInterval(thoughtSpawnerRef.current);
  }, []);

  useEffect(() => {
    if (interference >= MAX_INTERFERENCE && gameState === 'playing') {
      endGame();
    }
  }, [interference, gameState, endGame]);

  const startGame = () => {
    setGameState('playing');
    timeRef.current = 0;
    tickRef.current = 0;
    setTimeElapsed(0);
    setPotential(0);
    setInterference(0);
    setThoughts([]);
    updateStreak(0);
    setHasSlowDown(false);
    setIsSlowed(false);
    setHistory([]);
    const nextBall = spawnBall(getDifficulty(0).multi);
    ballRef.current = nextBall;
    setBallState(nextBall);
    setCanCenter(true);

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    gameLoopRef.current = window.setInterval(() => {
      timeRef.current += 0.05;
      setTimeElapsed(timeRef.current);

      const currentDiff = getDifficulty(timeRef.current);
      const prevBall = ballRef.current;
      const speedMult = isSlowedRef.current ? 0.5 : 1.0;

      let newX = prevBall.x + (prevBall.vx * speedMult);
      let newVy = prevBall.vy + (prevBall.curve * speedMult);
      let newY = prevBall.y + (newVy * speedMult);

      if (newY < 12 || newY > 88) {
        newVy *= -1;
        newY = prevBall.y + (newVy * speedMult);
        prevBall.curve *= 0.8;
        playSound('bounce');
      }

      const currentlyInFlow = streakRef.current >= 3;
      let effectiveMax = prevBall.hitZone.max;
      if (currentlyInFlow) {
        const width = prevBall.hitZone.max - prevBall.hitZone.min;
        effectiveMax += width * 0.1;
      }

      if (newX > effectiveMax + 5) {
        setInterference((value) => Math.min(MAX_INTERFERENCE, value + 10));
        updateStreak(0);
        setIsSlowed(false);
        setHasSlowDown(false);
        showFeedback('Missed Cue (Broadened Focus)');
        playSound('bounce');
        const resetBall = spawnBall(currentDiff.multi);
        ballRef.current = resetBall;
        setBallState(resetBall);
      } else {
        const nextBall = { ...prevBall, x: newX, y: newY, vy: newVy };
        ballRef.current = nextBall;
        setBallState(nextBall);
      }

      tickRef.current += 1;
      if (tickRef.current % 20 === 0) {
        setInterference((currentInterference) => {
          setHistory((prevHistory) => [...prevHistory, { time: timeRef.current, i: currentInterference }]);
          return currentInterference;
        });
      }

      setThoughts((prevThoughts) => {
        if (prevThoughts.length > 0 && streakRef.current < 3) {
          setInterference((value) => Math.min(MAX_INTERFERENCE, value + (prevThoughts.length * 0.1)));
        }
        return prevThoughts;
      });
    }, 50);

    thoughtSpawnerRef.current = window.setInterval(() => {
      setThoughts((prevThoughts) => {
        if (streakRef.current >= 3) return prevThoughts;

        if (prevThoughts.length < 5 && Math.random() > 0.4) {
          const nextThought = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            text: SELF_1_THOUGHTS[Math.floor(Math.random() * SELF_1_THOUGHTS.length)],
            x: Math.random() * 60 + 10,
            y: Math.random() * 80 + 10
          };
          return [...prevThoughts, nextThought];
        }

        return prevThoughts;
      });
    }, 2000);

    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(thoughtSpawnerRef.current);
    };
  }, [gameState, endGame, playSound, showFeedback, updateStreak]);

  const handleHitBall = () => {
    const current = ballRef.current;

    let min = current.hitZone.min;
    let max = current.hitZone.max;
    const currentlyInFlow = streakRef.current >= 3;

    if (currentlyInFlow) {
      const width = max - min;
      min -= width * 0.1;
      max += width * 0.1;
    }

    if (current.x >= min && current.x <= max) {
      playSound('hit');

      const willBeFlow = streakRef.current >= 2;
      if (willBeFlow && streakRef.current === 2) {
        setThoughts([]);
        setInterference(0);
        setHasSlowDown(true);
      }

      updateStreak((value) => value + 1);
      setPotential((value) => value + (willBeFlow ? 100 : 50));
      setInterference((value) => Math.max(0, value - 10));
      showFeedback(willBeFlow ? 'FLOW STATE ACHIEVED' : 'Zone State! (Narrow-External)');
    } else {
      playSound('bounce');
      updateStreak(0);
      setHasSlowDown(false);
      setInterference((value) => Math.min(MAX_INTERFERENCE, value + 15));
      showFeedback('Forced it! (Self 1 Control)');
    }

    setIsSlowed(false);
    const nextBall = spawnBall(getDifficulty(timeRef.current).multi);
    ballRef.current = nextBall;
    setBallState(nextBall);
  };

  const handleDismissThought = (id) => {
    setThoughts((prevThoughts) => prevThoughts.filter((item) => item.id !== id));
    setInterference((value) => Math.max(0, value - 5));
    setPotential((value) => value + 5);
  };

  const handleCentering = () => {
    if (!canCenter) return;
    setInterference((value) => Math.max(0, value - 40));
    setThoughts([]);
    showFeedback('Centered! (Arousal Regulated)');
    setCanCenter(false);
    window.setTimeout(() => setCanCenter(true), 10000);
  };

  const handleActivateSlow = () => {
    if (!hasSlowDown) return;
    setHasSlowDown(false);
    setIsSlowed(true);
    playSound('slow');
    showFeedback('FOCUS DILATION (0.5X SPEED)');
  };

  const isFlowState = streak >= 3;
  const currentStage = getDifficulty(timeElapsed).stage;

  let uiMin = ballState.hitZone.min;
  let uiMax = ballState.hitZone.max;
  if (isFlowState) {
    const width = uiMax - uiMin;
    uiMin -= width * 0.1;
    uiMax += width * 0.1;
  }

  const spotlightSize = isFlowState ? 100 : Math.max(15, 100 - (interference * 0.85));
  const spotlightAlpha = isFlowState ? 0 : Math.min(0.95, (interference / 100) + 0.1);
  const jitterCSS = `
    @keyframes jitter {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      25% { transform: translate(-1px, -2px) rotate(-1deg); }
      50% { transform: translate(-2px, 1px) rotate(1deg); }
      75% { transform: translate(2px, -1px) rotate(0deg); }
      100% { transform: translate(1px, 2px) rotate(-1deg); }
    }
    .jitter-extreme { animation: jitter 0.15s cubic-bezier(0.36,0.07,0.19,0.97) infinite; }
  `;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-8 flex items-center justify-center selection:bg-lime-400 selection:text-black">
      <style>{jitterCSS}</style>
      <div className={`max-w-5xl w-full bg-zinc-900 md:rounded-2xl shadow-2xl overflow-hidden border-t-4 ${isFlowState ? 'border-t-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]' : 'border-t-lime-400'} border-x border-b border-zinc-800 ${gameState === 'playing' && interference > 75 && !isFlowState ? 'jitter-extreme border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : ''}`}>
        <div className="bg-black p-5 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2 rounded-sm skew-x-[-10deg] ${isFlowState ? 'bg-cyan-400' : 'bg-lime-400'}`}>
              <Activity className="text-black w-6 h-6 skew-x-[10deg]" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] mb-1">Phase 3 Focus Game</p>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Inner Game <span className="text-lime-400">Pro</span></h1>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] mt-1">Performance = Potential - Interference</p>
            </div>
          </div>

          {gameState === 'playing' && (
            <div className="flex gap-4 text-sm font-black uppercase tracking-wider bg-zinc-900 px-6 py-2 rounded-sm border border-zinc-800 relative z-10 font-mono shadow-inner">
              <div className="text-lime-400 flex flex-col items-center leading-none"><span className="text-[10px] text-zinc-500">POT</span>{potential}</div>
              <div className="text-zinc-600 flex flex-col items-center leading-none"><span className="text-[10px] opacity-0">-</span>-</div>
              <div className="text-red-500 flex flex-col items-center leading-none"><span className="text-[10px] text-zinc-500">INT</span>{Math.floor(interference)}</div>
              <div className="text-zinc-600 flex flex-col items-center leading-none"><span className="text-[10px] opacity-0">=</span>=</div>
              <div className="text-white flex flex-col items-center leading-none"><span className="text-[10px] text-lime-400">PERF</span>{performance}</div>
            </div>
          )}
        </div>

        {gameState === 'intro' && (
          <div className="p-8 md:p-16 space-y-10 bg-zinc-900 min-h-[600px] flex flex-col justify-center">
            <div className="text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Optimize Your <span className="text-lime-400">Execution</span></h2>
              <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest max-w-xl mx-auto">
                Endless survival protocol. Session terminates at 100 percent distress.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto w-full">
              <div className="bg-black/50 p-6 border border-zinc-800 hover:border-red-500/50 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-500/10 p-2 rounded">
                    <AlertCircle className="text-red-500" size={20} />
                  </div>
                  <h3 className="font-black text-white uppercase tracking-wide">Self 1: The Teller</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Analytical thoughts create <strong className="text-white">interference</strong>. Failing to tap and dismiss them narrows attention until the court disappears.</p>
                <div className="bg-red-500 text-black px-3 py-2 text-xs font-black uppercase tracking-widest text-center cursor-crosshair transform group-hover:scale-[1.02] transition-transform">
                  Target and tap to quiet Self 1
                </div>
              </div>

              <div className="bg-black/50 p-6 border border-zinc-800 hover:border-lime-400/50 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-lime-400"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-lime-400/10 p-2 rounded">
                    <Target className="text-lime-400" size={20} />
                  </div>
                  <h3 className="font-black text-white uppercase tracking-wide">Self 2: The Doer</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Instinctive execution increases <strong className="text-white">potential</strong>. String three hits together to trigger flow, widen the hit zone, and earn a time-dilation charge.</p>
                <div className="bg-lime-400 text-black px-3 py-2 text-xs font-black uppercase tracking-widest text-center cursor-crosshair transform group-hover:scale-[1.02] transition-transform">
                  Strike the ball in the focus zone
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto w-full">
              <div className="border border-zinc-800 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Focus brief</p>
                <p className="mt-3 text-sm text-zinc-300 leading-6">This version brings the imported Inner Game simulator into the Sports Wellness performance layer so learners can practice attention control without leaving the course shell.</p>
              </div>
              <div className="border border-zinc-800 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Controls</p>
                <p className="mt-3 text-sm text-zinc-300 leading-6">Tap red interference cards to clear Self 1, click the ball when it reaches the hit zone, and use Center only when arousal starts to run the session.</p>
              </div>
              <div className="border border-zinc-800 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Goal</p>
                <p className="mt-3 text-sm text-zinc-300 leading-6">Stay alive as long as possible while proving the core Phase 3 lesson: performance improves when potential rises and interference falls.</p>
              </div>
            </div>

            <div className="pt-10 flex justify-center pb-8 md:pb-0">
              <button
                onClick={startGame}
                className="bg-lime-400 hover:bg-lime-300 text-black font-black text-xl px-12 py-5 uppercase tracking-[0.2em] flex items-center gap-3 transition-all transform hover:scale-105 skew-x-[-10deg] shadow-[0_0_40px_rgba(163,230,53,0.3)] hover:shadow-[0_0_60px_rgba(163,230,53,0.5)]"
              >
                <div className="skew-x-[10deg] flex items-center gap-3">
                  <Play fill="currentColor" size={24} /> Initialize Session
                </div>
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div
            className="relative h-[600px] w-full overflow-hidden select-none shadow-inner border-y-8 border-black"
            style={{ background: 'linear-gradient(180deg, rgba(0, 255, 202, 0.05), rgba(11, 17, 26, 0.35)), var(--performance-game-bg-alt)' }}
          >
            <div
              className="absolute top-[10%] bottom-[10%] left-[5%] right-[5%] border-4 border-white shadow-[inset_0_0_50px_rgba(0,0,0,0.3)] flex"
              style={{ background: 'linear-gradient(180deg, rgba(0, 255, 202, 0.06), rgba(15, 19, 26, 0.18)), var(--performance-game-panel)' }}
            >
              <div className="w-1/2 h-full border-r-[6px] border-white/90 relative z-10 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                <div className="absolute top-[15%] bottom-[15%] right-0 w-[45%] border-4 border-white flex flex-col">
                  <div className="h-1/2 w-full border-b-4 border-white"></div>
                </div>
              </div>
              <div className="w-1/2 h-full relative z-0">
                <div className="absolute top-[15%] bottom-[15%] left-0 w-[45%] border-4 border-white flex flex-col">
                  <div className="h-1/2 w-full border-b-4 border-white"></div>
                </div>
              </div>
            </div>

            <div
              className={`absolute top-[10%] bottom-[10%] border-l-[3px] border-r-[3px] flex items-center justify-center pointer-events-none transition-all duration-300 z-10 backdrop-blur-[1px] ${isFlowState ? 'bg-lime-400/20 border-lime-400' : 'bg-lime-400/10 border-lime-400/50'}`}
              style={{
                left: `${uiMin}%`,
                width: `${uiMax - uiMin}%`
              }}
            >
              <div className={`font-black uppercase tracking-widest rotate-90 whitespace-nowrap flex flex-col items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isFlowState ? 'text-lime-400' : 'text-lime-400'}`}>
                <span className="text-xl">Hit Zone {isFlowState && '+20%'}</span>
                <span className="text-[10px] mt-1 font-mono tracking-[0.3em] bg-black/50 px-2 py-0.5">[{ballState.label}]</span>
              </div>
            </div>

            <div
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 z-20 ${isFlowState ? 'shadow-[0_0_30px_rgba(0,255,202,0.28),inset_-3px_-3px_8px_rgba(0,0,0,0.4)]' : 'shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.4),_0_10px_15px_rgba(0,0,0,0.5)]'}`}
              style={{
                left: `${ballState.x}%`,
                top: `${ballState.y}%`,
                transform: `translate(-50%, -50%) rotate(${ballState.x * (ballState.curve >= 0 ? 12 : -12)}deg)`,
                background: isFlowState
                  ? 'radial-gradient(circle at 30% 30%, #c7fff2, #00a676)'
                  : 'radial-gradient(circle at 30% 30%, #effff9, #00cf99)',
                transition: 'none'
              }}
              onClick={handleHitBall}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
                <path d="M 30 5 A 45 45 0 0 0 30 95 M 70 5 A 45 45 0 0 1 70 95" stroke="white" strokeWidth="8" fill="none"></path>
              </svg>
            </div>

            {thoughts.map((thought) => (
              <div
                key={thought.id}
                className="absolute bg-zinc-950/95 text-red-400 px-4 py-2 text-xs font-mono font-bold shadow-2xl cursor-pointer hover:bg-black border-l-4 border-red-500 uppercase tracking-wider z-30 transition-all"
                style={{
                  left: `${thought.x}%`,
                  top: `${thought.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDismissThought(thought.id);
                }}
              >
                ERR: {thought.text}
              </div>
            ))}

            <div
              className="pointer-events-none absolute inset-0 transition-all duration-300 z-40"
              style={{
                background: `radial-gradient(circle ${spotlightSize}vmax at 50% 50%, transparent 0%, rgba(0, 0, 0, ${spotlightAlpha}) 100%)`
              }}
            ></div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-50">
              <div className="flex gap-4">
                <div className={`bg-black/90 px-4 py-2 border-l-2 pointer-events-auto ${isFlowState ? 'border-lime-400' : 'border-lime-400'}`}>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Time Survived</div>
                  <div className="text-xl font-mono font-black text-white">{Math.floor(timeElapsed)}<span className="text-sm text-lime-400">s</span></div>
                </div>
                <div className="bg-black/90 px-4 py-2 border-l-2 border-lime-400 pointer-events-auto hidden md:block">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Learning Phase</div>
                  <div className="text-sm font-black text-white uppercase mt-1.5">{currentStage}</div>
                </div>
                {isFlowState && (
                  <div className="bg-lime-400/10 px-4 py-2 border border-lime-400 pointer-events-auto animate-pulse">
                    <div className="text-[10px] text-lime-400 uppercase tracking-[0.2em] mb-1">Streak {streak}</div>
                    <div className="text-sm font-black text-lime-400 uppercase mt-1.5 drop-shadow-[0_0_8px_rgba(0,255,202,0.4)]">FLOW STATE</div>
                  </div>
                )}
              </div>

              <div className="bg-black/90 px-4 py-2 border-r-2 border-red-500 w-48 pointer-events-auto">
                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 flex justify-between">
                  <span>Distress Level</span>
                  <span className="text-red-500 font-black">{Math.floor(interference)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                    style={{ width: `${Math.min(100, interference)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] uppercase tracking-tight pointer-events-none z-50 mix-blend-overlay">
                {feedback}
              </div>
            )}

            <div className="absolute bottom-6 w-full px-8 pointer-events-none z-50 flex justify-between items-end">
              <div className="pointer-events-auto w-1/3">
                {isFlowState && (
                  <button
                    onClick={handleActivateSlow}
                    disabled={!hasSlowDown}
                    className={`flex items-center gap-2 px-5 py-3 font-black uppercase tracking-wider shadow-2xl transition-all skew-x-[-10deg] ${
                      hasSlowDown
                        ? 'bg-lime-400 hover:bg-lime-300 text-black hover:scale-105 shadow-[0_0_20px_rgba(0,255,202,0.35)]'
                        : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700 cursor-not-allowed backdrop-blur shadow-none'
                    }`}
                  >
                    <div className="skew-x-[10deg] flex items-center gap-2 text-xs">
                      <Timer size={16} />
                      {hasSlowDown ? 'Focus Consumable: Dilate Time' : 'Time Dilated (0.5x)'}
                    </div>
                  </button>
                )}
              </div>

              <div className="pointer-events-auto w-1/3 flex justify-end">
                <button
                  onClick={handleCentering}
                  disabled={!canCenter}
                  className={`flex items-center gap-3 px-6 py-4 font-black uppercase tracking-widest shadow-2xl transition-all skew-x-[-10deg] ${
                    canCenter
                      ? 'bg-lime-400 hover:bg-lime-300 text-black hover:scale-105 shadow-[0_0_30px_rgba(0,255,202,0.35)]'
                      : 'bg-zinc-900/90 text-zinc-600 border border-zinc-800 cursor-not-allowed backdrop-blur shadow-none'
                  }`}
                >
                  <div className="skew-x-[10deg] flex items-center gap-2 text-sm">
                    <Activity size={18} className={canCenter ? 'text-[#07111d]' : ''} />
                    {canCenter ? 'Center (Breathe)' : 'Regulating...'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="p-8 md:p-12 bg-zinc-950 text-center min-h-[600px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10">
              <div className="inline-block bg-lime-400 text-black px-3 py-1 text-xs font-black uppercase tracking-[0.3em] mb-4">
                Session Terminated: Cognitive Overload
              </div>
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Performance Analytics</h2>
              <p className="text-zinc-500 mb-10 font-mono text-sm uppercase tracking-widest">Total Survival Time: <span className="text-white font-black">{Math.floor(timeElapsed)}s</span></p>

              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-zinc-900 p-6 border-t-2 border-lime-400 text-left">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1">Raw Output</div>
                  <div className="text-zinc-300 text-xs font-bold uppercase mb-4">Potential (Self 2)</div>
                  <div className="text-5xl font-mono font-black text-lime-400">{potential}</div>
                </div>
                <div className="bg-zinc-900 p-6 border-t-2 border-red-500 text-left">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1">Cognitive Drag</div>
                  <div className="text-zinc-300 text-xs font-bold uppercase mb-4">Final Interference</div>
                  <div className="text-5xl font-mono font-black text-red-500">{Math.floor(interference)}</div>
                </div>
                <div className="bg-zinc-900 p-6 border-t-2 border-lime-400 text-left transform scale-105 shadow-2xl">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1">Net Metric</div>
                  <div className="text-white text-xs font-black uppercase mb-4">Final Performance</div>
                  <div className="text-6xl font-mono font-black text-lime-400">{performance}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 tracking-widest">P = P - I</div>
                </div>
              </div>

              <div className="bg-black/50 p-6 border border-zinc-800 mb-10 max-w-3xl mx-auto relative group">
                <div className="text-left text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-4">Interference Over Time</div>
                <svg viewBox={`0 0 ${Math.max(60, Math.ceil(timeElapsed))} 100`} className="w-full h-32 overflow-visible border-b border-l border-zinc-700">
                  <polyline
                    points={history.map((point) => `${point.time},${100 - point.i}`).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  ></polyline>
                  <line x1="0" y1="25" x2={Math.max(60, Math.ceil(timeElapsed))} y2="25" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2" opacity="0.5"></line>
                </svg>
                <div className="absolute bottom-2 right-8 text-[10px] text-zinc-600 font-mono">{Math.max(60, Math.ceil(timeElapsed))}s</div>
                <div className="absolute top-10 -left-6 text-[10px] text-red-500/50 font-mono rotate-[-90deg]">75% THRESHOLD</div>
              </div>

              <div className="text-left bg-zinc-900 p-8 border border-zinc-800 mb-8 max-w-3xl mx-auto">
                <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Brain size={16} className="text-lime-400" /> Clinical Assessment
                </h3>
                <ul className="space-y-5 text-sm text-zinc-400 font-medium">
                  <li className="flex items-start gap-4">
                    <Target className="text-lime-400 mt-0.5 shrink-0" size={16} />
                    <span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Flow State Automaticity</strong> Hitting three targets engaged flow, blocked distractions, and kept the attentional field open.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
                    <span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Ignoring Self 1</strong> When analytical thoughts were ignored outside of flow, they compounded cognitive drag and tightened the spotlight fast.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Activity className="text-lime-400 mt-0.5 shrink-0" size={16} />
                    <span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Arousal Regulation</strong> The centering breath creates the tactical shift that restores control when arousal starts to run the session.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={startGame}
                className="bg-zinc-800 text-white hover:bg-zinc-700 font-black text-sm px-8 py-4 uppercase tracking-[0.2em] inline-flex items-center gap-3 transition-all border border-zinc-700 hover:border-zinc-500"
              >
                <RotateCcw size={18} /> Reboot Sequence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const rootNode = document.getElementById('root');
if (rootNode) {
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootNode).render(<InnerGameSimulator />);
  } else {
    ReactDOM.render(<InnerGameSimulator />, rootNode);
  }
}

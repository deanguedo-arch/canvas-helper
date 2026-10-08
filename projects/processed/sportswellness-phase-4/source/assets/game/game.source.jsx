const { useState, useEffect, useCallback, useRef } = React;
const { useArenaScale, scaleValue } = window.PerformanceGameScale;

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

function Database(props) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path>
      <path d="M4 11v8c0 1.7 3.6 3 8 3s8-1.3 8-3v-8"></path>
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

const ARENA_SIZE = { w: 1000, h: 600 };
const CORE_RADIUS = 60;
const MAX_CONFIDENCE = 1000;
const START_CONFIDENCE = 500;
const SPAWN_RATE_MS = 1500;
const GAME_TITLE = 'Confidence Account';
const WITHDRAWAL_DIRECT_CHANCE = 0.4;

const DEPOSITS = ['Used the practised setup.','Asked for useful feedback.','My entry was late; use the agreed count.','Revised the unclear instruction.','Recorded effort and progress.','Prepared the first task cue.','Practised the correction.','The evidence is missing; add a relevant example.'];

const WITHDRAWALS = [
  'I am terrible.', 'I always choke.', 'Coach hates me.',
  "I'm going to fail.", "I'm an imposter.", "I'm not built for this.",
  'I ruin everything.', 'This is a disaster.'
];

function MentalFilterSimulatorGame() {
  const [gameState, setGameState] = useState('intro');
  const [confidence, setConfidence] = useState(START_CONFIDENCE);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stats, setStats] = useState({ deposits: 0, lockdowns: 0, drains: 0 });
  const [transactions, setTransactions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const loopRef = useRef(null);
  const spawnerRef = useRef(null);
  const timeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const confidenceRef = useRef(START_CONFIDENCE);
  const { stageRef: arenaRef, scale: arenaScale } = useArenaScale(ARENA_SIZE, { minScale: 0.92, maxScale: 1.65 });

  useEffect(() => {
    confidenceRef.current = confidence;
  }, [confidence]);

  const playSound = useCallback((type) => { if(window.CourseGameBridge.muted)return;
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

    if (type === 'approve') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'lockdown') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'damage') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    window.CourseGameBridge.setTimeout(() => setIsShaking(false), 300);
  }, []);

  const showFloatingFeedback = useCallback((msg, color, x, y) => {
    const id = window.CourseGameBridge.now() + Math.random();
    setFeedback({ id, msg, color, x, y });
    window.CourseGameBridge.setTimeout(() => setFeedback(null), 800);
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameover');
  }, []);

  const winGame = useCallback(() => {
    setGameState('win');
  }, []);

  const spawnTransaction = useCallback(() => {
    setTransactions((current) => {
      if (current.length >= 12) return current;

      const confRatio = confidenceRef.current / MAX_CONFIDENCE;
      const depositChance = 0.2 + confRatio * 0.6;
      const isDeposit = Math.random() < depositChance;
      const textArray = isDeposit ? DEPOSITS : WITHDRAWALS;
      const text = textArray[Math.floor(Math.random() * textArray.length)];

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(ARENA_SIZE.w, ARENA_SIZE.h) / 2 + 50;
      const startX = ARENA_SIZE.w / 2 + Math.cos(angle) * radius;
      const startY = ARENA_SIZE.h / 2 + Math.sin(angle) * radius;

      const withdrawalBaseSpeed = 0.8 + confRatio * 2.2;
      const movementProfile = isDeposit
        ? 'direct'
        : (Math.random() < WITHDRAWAL_DIRECT_CHANCE ? 'direct' : 'erratic');
      const speed = isDeposit
        ? 1.8 + Math.random() * 1.2
        : movementProfile === 'direct'
          ? 1.8 + Math.random() * 1.2
          : withdrawalBaseSpeed + Math.random() * 0.6;
      const vx = -Math.cos(angle) * speed;
      const vy = -Math.sin(angle) * speed;

      return [
        ...current,
        {
          id: window.CourseGameBridge.now() + Math.random(),
          type: isDeposit ? 'deposit' : 'withdrawal',
          text,
          x: startX,
          y: startY,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          wobbleFreq: movementProfile === 'erratic' ? 0.1 + Math.random() * 0.15 : 0,
          wobbleAmp: movementProfile === 'erratic' ? 0.5 + Math.random() * 1.5 : 0,
          movementProfile,
          age: 0,
          status: 'incoming'
        }
      ];
    });
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      cancelAnimationFrame(loopRef.current);
      clearInterval(spawnerRef.current);
      return undefined;
    }

    let lastTime = window.CourseGameBridge.now();
    spawnerRef.current = setInterval(() => {
      spawnTransaction();
    }, SPAWN_RATE_MS);

    const update = () => {
      const time = window.CourseGameBridge.now();
      const dt = Math.max(0, time - lastTime) / 16.66;
      lastTime = time;

      timeRef.current += (16.66 * dt) / 1000;
      setTimeElapsed(timeRef.current);

      setTransactions((current) => {
        const next = [];
        let damageTaken = 0;

        for (const transaction of current) {
          if (transaction.status !== 'incoming') continue;

          let currentVx = transaction.vx;
          let currentVy = transaction.vy;
          const newAge = (transaction.age || 0) + dt;

          if (transaction.type === 'withdrawal' && transaction.movementProfile === 'erratic') {
            const perpX = -transaction.baseVy;
            const perpY = transaction.baseVx;
            const wobble = Math.sin(newAge * transaction.wobbleFreq) * transaction.wobbleAmp
              + Math.cos(newAge * transaction.wobbleFreq * 2.1) * (transaction.wobbleAmp * 0.6);
            currentVx = transaction.baseVx + perpX * wobble;
            currentVy = transaction.baseVy + perpY * wobble;
          }

          const nx = transaction.x + currentVx * dt;
          const ny = transaction.y + currentVy * dt;
          const distToCenter = Math.hypot(ARENA_SIZE.w / 2 - nx, ARENA_SIZE.h / 2 - ny);

          if (distToCenter < CORE_RADIUS) {
            if (transaction.type === 'withdrawal') {
              damageTaken += 75;
              playSound('damage');
              triggerShake();
              setStats((statsState) => ({ ...statsState, drains: statsState.drains + 1 }));
              showFloatingFeedback('UNHANDLED CARD: -75', 'text-red-500', nx, ny);
            }
            continue;
          }

          next.push({ ...transaction, x: nx, y: ny, age: newAge });
        }

        if (damageTaken > 0) {
          setConfidence((currentConfidence) => {
            const nextConfidence = Math.max(0, currentConfidence - damageTaken);
            if (nextConfidence <= 0) endGame();
            return nextConfidence;
          });
        }

        return next;
      });

      if (confidenceRef.current >= MAX_CONFIDENCE) {
        winGame();
        return;
      }

      loopRef.current = requestAnimationFrame(update);
    };

    loopRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(loopRef.current);
      clearInterval(spawnerRef.current);
    };
  }, [endGame, gameState, playSound, showFloatingFeedback, spawnTransaction, triggerShake, winGame]);

  const handleTransactionChoice = (id, actualType, chosenAction, x, y, event) => {
    event.stopPropagation();
    if (gameState !== 'playing') return;

    setTransactions((current) => {
      const updated = current.map((transaction) => {
        if (transaction.id === id) {
          return { ...transaction, status: chosenAction === 'approve' ? 'approved' : 'locked' };
        }
        return transaction;
      });

      window.CourseGameBridge.setTimeout(() => {
        setTransactions((latest) => latest.filter((transaction) => transaction.id !== id));
      }, 100);

      return updated;
    });

    if (actualType === 'deposit' && chosenAction === 'approve') {
      playSound('approve');
      setConfidence((current) => Math.min(MAX_CONFIDENCE, current + 25));
      setStats((current) => ({ ...current, deposits: current.deposits + 1 }));
      showFloatingFeedback('DEPOSIT APPROVED +25', 'text-lime-400', x, y);
      return;
    }

    if (actualType === 'withdrawal' && chosenAction === 'lockdown') {
      playSound('lockdown');
      setConfidence((current) => Math.min(MAX_CONFIDENCE, current + 10));
      setStats((current) => ({ ...current, lockdowns: current.lockdowns + 1 }));
      showFloatingFeedback('[TEMPORARY & LIMITED] CONTAINED', 'text-amber-400', x, y);
      return;
    }

    if (actualType === 'withdrawal' && chosenAction === 'approve') {
      playSound('damage');
      triggerShake();
      setConfidence((current) => {
        const nextConfidence = Math.max(0, current - 75);
        if (nextConfidence <= 0) endGame();
        return nextConfidence;
      });
      setStats((current) => ({ ...current, drains: current.drains + 1 }));
      showFloatingFeedback('GLOBAL JUDGMENT APPROVED: -75', 'text-red-500', x, y);
      return;
    }

    if (actualType === 'deposit' && chosenAction === 'lockdown') {
      playSound('damage');
      setConfidence((current) => {
        const nextConfidence = Math.max(0, current - 15);
        if (nextConfidence <= 0) endGame();
        return nextConfidence;
      });
      showFloatingFeedback('EVIDENCE REJECTED! -15', 'text-orange-400', x, y);
    }
  };

  const initGame = () => {
    setConfidence(START_CONFIDENCE);
    setTimeElapsed(0);
    setStats({ deposits: 0, lockdowns: 0, drains: 0 });
    setTransactions([]);
    setFeedback(null);
    timeRef.current = 0;
    confidenceRef.current = START_CONFIDENCE;
    setGameState('playing');

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const confPct = (confidence / MAX_CONFIDENCE) * 100;
  const currentDepositChance = Math.round((0.2 + (confidence / MAX_CONFIDENCE) * 0.6) * 100);

  let coreColor = 'border-cyan-500 shadow-cyan-500/50 text-cyan-400';
  let coreBg = 'bg-cyan-500/10';
  if (confPct < 30) {
    coreColor = 'border-red-500 shadow-red-500/80 text-red-500';
    coreBg = 'bg-red-500/20';
  } else if (confPct > 75) {
    coreColor = 'border-lime-400 shadow-lime-400/50 text-lime-400';
    coreBg = 'bg-lime-400/10';
  }

  const shakeCSS = `
    @keyframes tacticalShake {
      0% { transform: translate(2px, 1px) rotate(0deg); }
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
    .shake-severe { animation: tacticalShake 0.15s infinite; }
  `;
  const outerRingSize = scaleValue(800, arenaScale, { min: 420, max: 1320 });
  const middleRingSize = scaleValue(500, arenaScale, { min: 280, max: 820 });
  const innerRingSize = scaleValue(250, arenaScale, { min: 150, max: 420 });
  const coreDiameter = scaleValue(CORE_RADIUS * 2, arenaScale, { min: 96, max: 220 });
  const coreIconSize = scaleValue(24, arenaScale, { min: 20, max: 44 });
  const coreLabelSize = scaleValue(10, arenaScale, { min: 9, max: 18 });
  const transactionScale = Math.max(0.92, Math.min(1.45, arenaScale));

  window.CourseGameBridge.useControls({gameState,setGameState,score:confidence,elapsed:timeElapsed,restart:initGame,audio:audioCtxRef,reason:"The game account reached its lower ending limit."});

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-4 xl:p-6 selection:bg-lime-400 selection:text-black">
      <style>{shakeCSS}</style>

      <div className={`w-full min-h-screen md:min-h-[calc(100vh-32px)] bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative ${isShaking ? 'shake-severe border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : ''}`}>
        <div className="bg-black p-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50">
          <div className="flex items-center gap-3">
            <Database className="text-lime-400 w-6 h-6" />
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-1">Phase 4 Mental Filter Simulator Game</p>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                {GAME_TITLE.split(' ')[0]} <span className="text-lime-400">{GAME_TITLE.split(' ')[1]}</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">Mental Filter System v1.0</p>
            </div>
          </div>

          {(gameState === 'playing' || gameState === 'win' || gameState === 'gameover') && (
            <div className="game-score-strip flex gap-4 font-mono text-xs uppercase tracking-widest bg-zinc-900 px-4 py-2 border border-zinc-800 rounded">
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4">
                <span className="text-zinc-500 text-[9px] mb-1">Uptime</span>
                <span className="text-white font-bold">{timeElapsed.toFixed(1)}s</span>
              </div>
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4 pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Account Balance</span>
                <span className={`${confPct <= 30 ? 'text-red-500 animate-pulse' : 'text-lime-400'} font-bold`}>{Math.floor(confidence)}</span>
              </div>
              <div className="flex flex-col items-center border-r border-zinc-800 pr-4 pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Deposit Rate</span>
                <span className="text-lime-400 font-bold">{currentDepositChance}%</span>
              </div>
              <div className="flex flex-col items-center pl-2">
                <span className="text-zinc-500 text-[9px] mb-1">Cards blocked</span>
                <span className="text-amber-400 font-bold">{stats.lockdowns}</span>
              </div>
            </div>
          )}
        </div>

        <div ref={arenaRef} className="relative w-full bg-zinc-950 overflow-hidden select-none flex-1 min-h-[420px] md:min-h-[700px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700" style={{ width: `${outerRingSize}px`, height: `${outerRingSize}px` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700" style={{ width: `${middleRingSize}px`, height: `${middleRingSize}px` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 border-dashed" style={{ width: `${innerRingSize}px`, height: `${innerRingSize}px` }} />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-700" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-700" />
          </div>

          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${coreColor} ${coreBg} flex flex-col items-center justify-center shadow-[0_0_30px_currentColor] transition-all duration-300 z-10 backdrop-blur-sm`} style={{ width: `${coreDiameter}px`, height: `${coreDiameter}px` }}>
            <BrainCircuit className="mb-1 opacity-80" size={coreIconSize} />
            <span className="font-black uppercase tracking-widest text-center leading-tight" style={{ fontSize: `${coreLabelSize}px` }}>
              Game<br />Account
            </span>
          </div>

          {gameState === 'playing' && transactions.map((transaction) => (
            transaction.status !== 'incoming' ? null : (
              <div
                key={transaction.id}
                className="absolute p-3 border border-zinc-600/50 bg-zinc-900/95 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2 backdrop-blur z-20 rounded min-w-[160px]"
                style={{
                  left: `${(transaction.x / ARENA_SIZE.w) * 100}%`,
                  top: `${(transaction.y / ARENA_SIZE.h) * 100}%`,
                  minWidth: `${scaleValue(160, transactionScale, { min: 150, max: 260 })}px`,
                  transform: `translate(-50%, -50%) scale(${transactionScale})`
                }}
              >
                <div className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-100 text-center px-2">
                  "{transaction.text}"
                </div>

                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={(event) => handleTransactionChoice(transaction.id, transaction.type, 'approve', transaction.x, transaction.y, event)}
                    className="flex-1 text-[9px] uppercase tracking-[0.1em] py-1.5 rounded bg-lime-500/20 text-lime-400 hover:bg-lime-500/40 border border-lime-500/50 transition-colors font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(event) => handleTransactionChoice(transaction.id, transaction.type, 'lockdown', transaction.x, transaction.y, event)}
                    className="flex-1 text-[9px] uppercase tracking-[0.1em] py-1.5 rounded bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/50 transition-colors font-bold"
                  >
                    Lockdown
                  </button>
                </div>
              </div>
            )
          ))}

          {feedback && (
            <div
              key={feedback.id}
              className={`absolute text-sm md:text-base font-black ${feedback.color} drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] uppercase tracking-widest pointer-events-none z-50 animate-bounce whitespace-nowrap bg-black/50 px-3 py-1 rounded`}
              style={{
                left: `${(feedback.x / ARENA_SIZE.w) * 100}%`,
                top: `${(feedback.y / ARENA_SIZE.h) * 100}%`,
                transform: `translate(-50%, -50%) scale(${Math.max(0.95, Math.min(1.25, arenaScale))})`
              }}
            >
              {feedback.msg}
            </div>
          )}

          {gameState === 'playing' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-md bg-black/80 border border-zinc-800 p-4 rounded backdrop-blur">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">Game Account Balance</span>
                <span className={`text-xs font-black font-mono ${coreColor}`}>{Math.floor(confidence)} / {MAX_CONFIDENCE}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div className={`h-full transition-all duration-200 ${coreBg.replace('/10', '').replace('/20', '')}`} style={{ width: `${confPct}%` }} />
              </div>
            </div>
          )}

          {gameState === 'intro' && (<div className="course-game-message"><h2>Evidence sorting game</h2><p>Read the moving statement cards. Approve specific preparation evidence and useful task-based corrections. Use Lockdown for a global personal attack. Some cards offer the Approve choice; others offer Lockdown, following the original routing mechanic.</p><p>The fictional account starts at 500 points. Unhandled cards and mismatched decisions can change the balance; 1000 points completes the round. The balance is not your confidence or identity.</p><p>Useful feedback is not an attack: “My entry was late; use the agreed count” belongs with information worth keeping. Use Start above.</p></div>)}

          {gameState === 'gameover' && (<div className="course-game-message"><h2>Round complete</h2><p>The game account reached its lower ending limit.</p><p>The game records inputs, timing and programmed consequences. It does not establish a cause of real performance or measure your psychology.</p><p>Review one rule in the debrief, or use Restart above.</p></div>)}

          {gameState === 'win' && (<div className="course-game-message"><h2>Game target reached</h2><p>You reached the target through this game's scoring rules. The score is not a teacher grade or a measure of confidence, motivation or ability.</p><p>Use the debrief to explain a rule and its limit. Restart is available above.</p></div>)}
        </div>
      </div>
    </div>
  );
}

const phase4Root = document.getElementById('root');
if (phase4Root && ReactDOM.createRoot) {
  ReactDOM.createRoot(phase4Root).render(<MentalFilterSimulatorGame />);
} else if (phase4Root) {
  ReactDOM.render(<MentalFilterSimulatorGame />, phase4Root);
}

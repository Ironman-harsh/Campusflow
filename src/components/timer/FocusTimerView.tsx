import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { playTimerCompletionSound, playTimerStartSound } from '../../utils/sound';
import { formatMinutesToHours, getTodayString } from '../../utils/dateUtils';

type TimerMode = 'focus' | 'short_break' | 'long_break';

export const FocusTimerView: React.FC = () => {
  const {
    settings,
    updateTimerSettings,
    subjects,
    activeTimerSubjectId,
    setActiveTimerSubjectId,
    logFocusSession,
    timerLogs,
  } = useApp();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeTimerSubjectId || subjects[0]?.id || ''
  );
  const [completedCyclesToday, setCompletedCyclesToday] = useState(0);

  // Sync if activeTimerSubjectId changes externally
  useEffect(() => {
    if (activeTimerSubjectId) {
      setSelectedSubjectId(activeTimerSubjectId);
    }
  }, [activeTimerSubjectId]);

  // Determine initial duration for current mode in seconds
  const getInitialSeconds = (timerMode: TimerMode): number => {
    switch (timerMode) {
      case 'focus':
        return settings.timerSettings.focusDuration * 60;
      case 'short_break':
        return settings.timerSettings.shortBreak * 60;
      case 'long_break':
        return settings.timerSettings.longBreak * 60;
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getInitialSeconds('focus'));
  const [totalDuration, setTotalDuration] = useState<number>(() => getInitialSeconds('focus'));

  const timerRef = useRef<number | null>(null);

  // Update duration when settings change and timer is stopped
  useEffect(() => {
    if (!isRunning) {
      const dur = getInitialSeconds(mode);
      setTimeLeft(dur);
      setTotalDuration(dur);
    }
  }, [settings.timerSettings, mode]);

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedSubjectId]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (settings.timerSettings.soundEnabled) {
      playTimerCompletionSound();
    }

    if (mode === 'focus') {
      const durationMins = settings.timerSettings.focusDuration;
      logFocusSession({
        subjectId: selectedSubjectId || undefined,
        durationMinutes: durationMins,
        type: 'focus',
      });

      const nextCycles = completedCyclesToday + 1;
      setCompletedCyclesToday(nextCycles);

      // Auto switch to break if desired
      if (nextCycles % settings.timerSettings.longBreakInterval === 0) {
        switchMode('long_break');
      } else {
        switchMode('short_break');
      }
    } else {
      // Break ended
      switchMode('focus');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const dur = getInitialSeconds(newMode);
    setTimeLeft(dur);
    setTotalDuration(dur);
  };

  const toggleTimer = () => {
    if (!isRunning && settings.timerSettings.soundEnabled) {
      playTimerStartSound();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const dur = getInitialSeconds(mode);
    setTimeLeft(dur);
    setTotalDuration(dur);
  };

  const addMinutes = (mins: number) => {
    const additionalSecs = mins * 60;
    setTimeLeft((prev) => prev + additionalSecs);
    setTotalDuration((prev) => prev + additionalSecs);
  };

  // Formatted display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular progress calculation
  const progressPercent = totalDuration > 0 ? (timeLeft / totalDuration) : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPercent);

  // Daily Stats from timerLogs
  const todayStr = getTodayString();
  const todayLogs = timerLogs.filter((l) => l.completedAt.startsWith(todayStr) && l.type === 'focus');
  const totalTodayMinutes = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Focus Timer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Deliberate focus intervals with scientifically proven rest cycles
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute quick toggle */}
          <button
            onClick={() =>
              updateTimerSettings({ soundEnabled: !settings.timerSettings.soundEnabled })
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              settings.timerSettings.soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={settings.timerSettings.soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
          >
            {settings.timerSettings.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Chimes On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Timer Interactive Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 ${
            mode === 'focus'
              ? 'bg-indigo-500'
              : mode === 'short_break'
              ? 'bg-emerald-500'
              : 'bg-cyan-500'
          }`}
        />

        {/* Mode Selector (Segmented buttons) */}
        <div className="flex items-center p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-8 relative z-10">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deep Focus ({settings.timerSettings.focusDuration}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break ({settings.timerSettings.shortBreak}m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break ({settings.timerSettings.longBreak}m)
          </button>
        </div>

        {/* Subject Association Picker */}
        <div className="flex items-center gap-2 mb-8 relative z-10">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Studying:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setActiveTimerSubjectId(e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="">General Academic Study</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-72 h-72 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              className="text-slate-800/80"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              className={`transition-all duration-300 ${
                mode === 'focus'
                  ? 'text-indigo-500'
                  : mode === 'short_break'
                  ? 'text-emerald-500'
                  : 'text-cyan-500'
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono-numbers tracking-tight">
              {formattedTime}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">
              {isRunning
                ? mode === 'focus'
                  ? 'Focusing'
                  : 'Resting'
                : 'Ready'}
            </span>
            {selectedSubject && (
              <span
                className="text-[11px] font-semibold mt-1 flex items-center gap-1"
                style={{ color: selectedSubject.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
                <span>{selectedSubject.code}</span>
              </span>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 mt-8 relative z-10">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl text-base font-bold text-white transition-all shadow-xl flex items-center gap-3 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : mode === 'focus'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{timeLeft < totalDuration ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleTimerComplete()}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Skip / Finish session"
            aria-label="Skip session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Quick adjustments (+5m, +10m) */}
        <div className="flex items-center gap-2 mt-6 text-xs text-slate-400">
          <span>Quick extend:</span>
          <button
            onClick={() => addMinutes(5)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            +5 min
          </button>
          <button
            onClick={() => addMinutes(10)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            +10 min
          </button>
        </div>
      </div>

      {/* Daily Progress & Recent Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Sessions */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Completed Sprints Today</span>
            <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
              {todayLogs.length}
            </div>
            <span className="text-xs text-slate-500">
              {settings.timerSettings.longBreakInterval - (completedCyclesToday % settings.timerSettings.longBreakInterval)} until long break
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Today's Focus Time */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Focused Today</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono-numbers">
              {formatMinutesToHours(totalTodayMinutes)}
            </div>
            <span className="text-xs text-slate-500">recorded to study stats</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Deep Work State */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Focus Momentum</span>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono-numbers">
              High
            </div>
            <span className="text-xs text-slate-500">zero distraction mode</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* History of Recent Focus Logs */}
      {timerLogs.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Recent Completed Sprints</span>
            </h3>
            <span className="text-xs text-slate-500">{timerLogs.length} total logged</span>
          </div>

          <div className="space-y-2">
            {timerLogs.slice(0, 5).map((log) => {
              const sub = subjects.find((s) => s.id === log.subjectId);
              const dateObj = new Date(log.completedAt);
              const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sub?.color || '#6366f1' }}
                    />
                    <span className="font-semibold text-slate-200">
                      {sub?.code || 'General Focus'}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-slate-400">{log.durationMinutes} minutes</span>
                  </div>

                  <span className="text-slate-500 font-mono-numbers">
                    {dateFormatted} at {timeFormatted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

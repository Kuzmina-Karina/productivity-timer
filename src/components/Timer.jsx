import React, { useState, useEffect, useCallback } from "react";

/**
 * Компонент таймера.
 * Отображает обратный отсчёт HH:MM:SS, кнопку СТОП,
 * звуковой сигнал и уведомление при истечении.
 */
export function Timer({ duration, isActive, onStop, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [finished, setFinished] = useState(false);

  /* Формат HH:MM:SS */
  const formatTime = useCallback((totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }, []);

  /* Звуковой сигнал через Web Audio API — три коротких бипа */
  const playAlarm = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    } catch {
      /* Звук недоступен — пропускаем */
    }
  }, []);

  /* Сброс при новом запуске */
  useEffect(() => {
    if (isActive && duration > 0) {
      setTimeLeft(duration);
      setFinished(false);
    }
  }, [duration, isActive]);

  /* Обратный отсчёт */
  useEffect(() => {
    if (!isActive || finished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFinished(true);
          playAlarm();
          onFinish?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, finished, playAlarm, onFinish]);

  /* CSS-класс дисплея */
  const displayClass = [
    "timer-display",
    isActive && !finished ? "active" : "",
    finished ? "finished" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="timer-wrapper">
      <div className={displayClass}>{formatTime(timeLeft)}</div>

      {finished && <div className="timer-alert">Время истекло!</div>}

      <button className="stop-btn" disabled={!isActive} onClick={onStop}>
        {finished ? "Сброс" : "Стоп"}
      </button>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";

/* Формат HH:MM:SS */
function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/* Три коротких бипа через Web Audio API */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.25;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.18);
    });
  } catch { /* звук недоступен */ }
}

export function Timer({ duration, active, onStop, onFinish }) {
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const endRef = useRef(0);
  const finishCalled = useRef(false);

  /* Запуск: запоминаем абсолютное время окончания */
  useEffect(() => {
    if (active && duration > 0) {
      endRef.current = Date.now() + duration * 1000;
      finishCalled.current = false;
      setLeft(duration);
      setDone(false);
    }
    if (!active) {
      setDone(false);
    }
  }, [active, duration]);

  /* Отсчёт на основе Date.now — точен даже после фонового режима */
  useEffect(() => {
    if (!active || done) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0 && !finishCalled.current) {
        finishCalled.current = true;
        setDone(true);
        playBeep();
        onFinish?.();
      }
    };

    tick();
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [active, done, onFinish]);

  /* CSS-классы */
  const state = done ? "done" : active ? "running" : "";

  return (
    <>
      <div className={"timer-ring " + state}>
        <div className={"digits " + state}>{fmt(left)}</div>
        <div className={"ring-label " + state}>
          {done ? "завершён" : active ? "идёт отсчёт" : "ожидание"}
        </div>
      </div>

      <div className="alert-text">
        {done ? "Время истекло!" : "\u00A0"}
      </div>

      <button className="stop-btn" disabled={!active} onClick={onStop}>
        Стоп
      </button>
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";

export const Timer = ({ timer, onTimerEnd, onTimerCancel, onTimerStart }) => {
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("");
  const intervalRef = useRef(null);
  const onTimerEndRef = useRef(onTimerEnd);
  const prevRemainingRef = useRef(0);

  // Актуальная ссылка на колбэк завершения
  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  });

  // --- Запуск / остановка интервала при смене timer ---
  useEffect(() => {
    if (!timer) {
      setRemaining(0);
      prevRemainingRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Инициализация обратного отсчёта
    setRemaining(timer.duration);
    prevRemainingRef.current = timer.duration;
    setFinished(false);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer]);

  // --- Детекция завершения: remaining перешёл от >0 к 0 ---
  useEffect(() => {
    if (timer && prevRemainingRef.current > 0 && remaining === 0) {
      setFinished(true);
      onTimerEndRef.current();
    }
    prevRemainingRef.current = remaining;
  }, [remaining, timer]);

  // Автоскрытие надписи "Время истекло!" через 4 секунды
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => setFinished(false), 4000);
    return () => clearTimeout(t);
  }, [finished]);

  // --- Ручной запуск из формы ---
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const mins = parseFloat(inputMinutes);
      if (!mins || mins <= 0) return;
      onTimerStart(Math.round(mins * 60));
      setInputMinutes("");
    },
    [inputMinutes, onTimerStart]
  );

  // Форматирование HH:MM:SS
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const display = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isActive = !!timer;

  return (
    <div className="timer-wrapper">
      {/* Крупный счётчик */}
      <div className={`timer-display ${isActive ? "active" : ""}`}>
        {display}
      </div>

      {/* Уведомление о завершении */}
      {finished && <div className="timer-finished">Время истекло!</div>}

      {/* Кнопка СТОП */}
      <button
        className="timer-stop-btn"
        disabled={!isActive}
        onClick={onTimerCancel}
      >
        СТОП
      </button>

      {/* Ручной ввод (виден только когда таймер не активен) */}
      {!isActive && !finished && (
        <form className="timer-form" onSubmit={handleSubmit}>
          <input
            className="timer-input"
            type="number"
            min="0.1"
            step="0.5"
            placeholder="Минуты"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
          />
          <button className="timer-start-btn" type="submit">
            Запустить
          </button>
        </form>
      )}

      {/* Подсказка */}
      {!isActive && !finished && (
        <p className="timer-hint">
          Или скажите: &laquo;Запусти таймер на 5 минут&raquo;
        </p>
      )}
    </div>
  );
};

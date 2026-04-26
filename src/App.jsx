import React, { useState, useEffect, useRef, useCallback } from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import { Timer } from "./components/Timer";
import "./App.css";

/* ====================================================================
   Извлечение action из события SDK (проверяем все варианты)
   ==================================================================== */
function extractAction(event) {
  if (event?.smart_app_data?.type) return event.smart_app_data;
  if (event?.action?.type) return event.action;

  const items = event?.items || event?.payload?.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item?.command?.smart_app_data?.type) return item.command.smart_app_data;
      if (item?.command?.type) return item.command;
    }
  }

  if (event?.server_action?.type) return event.server_action;
  return null;
}

/* ==================================================================== */

function App() {
  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(false);
  /* Уникальный ключ запуска — чтобы Timer.jsx гарантированно сбрасывался */
  const [startKey, setStartKey] = useState(0);
  const assistantRef = useRef(null);
  const initDone = useRef(false);

  /* Запуск таймера — единая функция для кнопок и голоса */
  const startTimer = useCallback((seconds) => {
    const sec = Math.max(1, Math.round(seconds));
    setDuration(sec);
    setActive(true);
    setStartKey((k) => k + 1);
  }, []);

  /* Остановка таймера — единая функция для кнопки и голоса */
  const stopTimer = useCallback(() => {
    setActive(false);
    setDuration(0);
    try {
      assistantRef.current?.sendData?.({ action: { action_id: "cancel_timer" } });
    } catch {}
  }, []);

  /* Таймер истёк — уведомляем сценарий */
  const handleFinish = useCallback(() => {
    try {
      assistantRef.current?.sendData?.({ action: { action_id: "timer_done" } });
    } catch {}
  }, []);

  /* Обработка событий от ассистента */
  const onData = useCallback((event) => {
    const action = extractAction(event);
    if (!action?.type) return;

    if (action.type === "set_timer") {
      startTimer(Number(action.duration) || 60);
    }
    if (action.type === "cancel_timer") {
      setActive(false);
      setDuration(0);
    }
  }, [startTimer]);

  /* Инициализация SDK */
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const appInfo = {
      applicationId: process.env.REACT_APP_SMARTAPP || "voice-timer",
      appversionId: "1.0.0",
      frontendType: "WEB_APP",
      projectId: process.env.REACT_APP_SMARTAPP || "voice-timer",
      systemName: "voice-timer",
      frontendEndpoint: "",
      frontendStateId: "",
    };

    const getState = () => ({ app_info: appInfo });

    try {
      if (process.env.NODE_ENV === "development") {
        assistantRef.current = createSmartappDebugger({
          token: process.env.REACT_APP_TOKEN || "",
          initPhrase: "запусти голосовой таймер",
          getState,
          nativePanel: { defaultText: "Скажите команду..." },
          appInitialData: [{ app_info: appInfo }],
        });
      } else {
        assistantRef.current = createAssistant({ getState });
      }

      assistantRef.current.on("data", onData);
    } catch (err) {
      console.warn("[SDK]", err.message);
    }
  }, [onData]);

  /* Кнопки быстрого запуска */
  const presets = [
    { label: "10 сек", sec: 10 },
    { label: "30 сек", sec: 30 },
    { label: "1 мин", sec: 60 },
    { label: "2 мин", sec: 120 },
    { label: "5 мин", sec: 300 },
  ];

  return (
    <div className="app">
      <div className="header">Голосовой таймер</div>

      <Timer
        key={startKey}
        duration={duration}
        active={active}
        onStop={stopTimer}
        onFinish={handleFinish}
      />

      {/* Кнопки быстрого запуска — видны когда таймер не активен */}
      {!active && (
        <div className="presets">
          {presets.map((p) => (
            <button
              key={p.sec}
              className="preset-btn"
              onClick={() => startTimer(p.sec)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {!active && (
        <div className="hint">
          или скажите: «Поставь таймер на 30 секунд»
        </div>
      )}
    </div>
  );
}

export default App;

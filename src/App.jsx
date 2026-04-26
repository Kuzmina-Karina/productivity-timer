import React, { useState, useEffect, useRef, useCallback } from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import { Timer } from "./components/Timer";
import "./App.css";

/**
 * Извлечение action из события ассистента.
 * В зависимости от версии SDK и типа команды данные приходят
 * в разных местах — проверяем все известные варианты.
 */
function extractAction(event) {
  /* smart_app_data — основной формат при $response.appendCommand */
  if (event?.smart_app_data?.type) return event.smart_app_data;

  /* Прямой action (старые версии SDK) */
  if (event?.action?.type) return event.action;

  /* Внутри items[].command — формат ответа с несколькими командами */
  const items = event?.items || event?.payload?.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      const cmd = item?.command;
      if (cmd?.type === "smart_app_data" && cmd?.smart_app_data?.type) {
        return cmd.smart_app_data;
      }
      if (cmd?.type) return cmd;
    }
  }

  /* server_action */
  if (event?.server_action?.type) return event.server_action;

  return null;
}

function App() {
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const assistantRef = useRef(null);

  /* Отправка server_action обратно в сценарий */
  const sendAction = useCallback((actionId) => {
    assistantRef.current?.sendData?.({
      action: { action_id: actionId },
    });
  }, []);

  /* Обработка всех событий от ассистента */
  const handleAssistantData = useCallback((event) => {
    const action = extractAction(event);
    if (!action?.type) return;

    if (action.type === "set_timer") {
      const seconds = Math.max(1, Math.round(Number(action.duration) || 60));
      setDuration(seconds);
      setIsActive(true);
    }

    if (action.type === "cancel_timer") {
      setIsActive(false);
      setDuration(0);
    }
  }, []);

  /* Инициализация Salute Assistant — один раз */
  useEffect(() => {
    /**
     * getState обязан возвращать объект с app_info,
     * иначе SDK упадёт с ошибкой "Cannot read properties of undefined (reading 'applicationId')"
     */
    const getState = () => ({
      app_info: {
        applicationId: process.env.REACT_APP_SMARTAPP || "voice-timer",
        appversionId: "1.0.0",
        frontendType: "WEB_APP",
        projectId: process.env.REACT_APP_SMARTAPP || "voice-timer",
        systemName: "voice-timer",
        frontendEndpoint: "",
        frontendStateId: "",
      },
    });

    if (process.env.NODE_ENV === "development") {
      assistantRef.current = createSmartappDebugger({
        token: process.env.REACT_APP_TOKEN || "",
        initPhrase: "запусти голосовой таймер",
        getState,
        nativePanel: { defaultText: "Скажите команду..." },
        appInitialData: [getState()],
      });
    } else {
      assistantRef.current = createAssistant({ getState });
    }

    assistantRef.current.on("data", handleAssistantData);
  }, [handleAssistantData]);

  /* Таймер истёк — сообщаем сценарию для голосового ответа */
  const handleFinish = useCallback(() => {
    sendAction("timer_done");
  }, [sendAction]);

  /* Ручная остановка кнопкой */
  const handleStop = useCallback(() => {
    setIsActive(false);
    setDuration(0);
    sendAction("cancel_timer");
  }, [sendAction]);

  return (
    <div className="app">
      <div className="app-title">Голосовой таймер</div>

      <Timer
        duration={duration}
        isActive={isActive}
        onStop={handleStop}
        onFinish={handleFinish}
      />

      {!isActive && (
        <div className="hint">
          Скажите: «Запусти таймер на 30 секунд»
          <br />
          или «Останови таймер»
        </div>
      )}
    </div>
  );
}

export default App;

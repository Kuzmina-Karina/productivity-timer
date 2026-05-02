import React, { useState, useEffect, useRef } from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import { Timer } from "./components/Timer";
import "./App.css";

// Конфигурация приложения для SmartApp Code
const appInfo = {
  applicationId: "salute-timer-smartapp",
  appversionId: "1.0.0",
  projectId: "salute-timer-smartapp",
  frontendType: "WEB_APP",
  systemName: "Salute Timer",
  frontendEndpoint: "",
  frontendStateId: "",
};

// Получение состояния
const getState = () => ({
  app_info: appInfo,
});

/** На localhost без эмулятора Salute голос не поднимется — см. блок подсказки в UI. */
function resolveAssistant(getStateFn) {
  const token =
    typeof process.env.REACT_APP_TOKEN === "string"
      ? process.env.REACT_APP_TOKEN.trim()
      : "";
  const isDev = process.env.NODE_ENV === "development";

  if (isDev && token) {
    return createSmartappDebugger({
      token,
      initPhrase:
        process.env.REACT_APP_INIT_PHRASE?.trim() ||
        "Запусти голосовой таймер",
      getState: getStateFn,
      appInitialData: [{ app_info: appInfo }],
      nativePanel: {
        defaultText: "Таймер на 10 секунд",
        screenshotMode: false,
      },
    });
  }

  return createAssistant({ getState: getStateFn });
}

let assistant = null;

// Универсально извлекаем команду от сценария из разных форматов события SDK / ответа бэкенда.
function extractCommand(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  /** Объект вида ответа Code: `{ type: "smart_app_data", smart_app_data: { type, duration } }`. */
  function fromSmartAppDataReply(reply) {
    if (
      reply &&
      reply.type === "smart_app_data" &&
      reply.smart_app_data &&
      typeof reply.smart_app_data === "object" &&
      reply.smart_app_data.type
    ) {
      return reply.smart_app_data;
    }
    return null;
  }

  const replyArrays = [
    event.replies,
    event.response?.responseData?.replies,
    event.responseData?.replies,
    event.payload?.replies,
  ];

  for (let k = 0; k < replyArrays.length; k++) {
    const arr = replyArrays[k];
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      const cmd = fromSmartAppDataReply(arr[i]);
      if (cmd) return cmd;
    }
  }

  const variants = [
    event.smart_app_data,
    event.action?.smart_app_data,
    event.action,
    event.server_action,
    event.command?.smart_app_data,
    event.command,
    event.payload?.smart_app_data,
    event.payload?.action,
    event.items?.[0]?.command,
    event.items?.[0]?.command?.smart_app_data,
    event.items?.[0]?.smart_app_data,
  ];

  for (const item of variants) {
    if (item && typeof item === "object" && item.type) {
      return item;
    }
  }

  return null;
}

function App() {
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [statusText, setStatusText] = useState("Готов к команде");
  const assistantInitialized = useRef(false);

  const devToken =
    typeof process.env.REACT_APP_TOKEN === "string"
      ? process.env.REACT_APP_TOKEN.trim()
      : "";
  const showDevVoiceHint =
    process.env.NODE_ENV === "development" && !devToken;

  // Инициализация ассистента для работы со сценарием SmartApp Code
  useEffect(() => {
    if (assistantInitialized.current) {
      return;
    }
    assistantInitialized.current = true;

    try {
      // В проде — хост Салюта; в dev на localhost — панель эмулятора при REACT_APP_TOKEN
      assistant = resolveAssistant(getState);

      // Получаем команды от сценария
      assistant.on("data", (event) => {
        console.log("📥 Событие от сценария:", event);

        const command = extractCommand(event);

        if (command?.type === "set_timer") {
          // Запускаем таймер по команде сценария.
          const duration = Math.max(1, Number(command.duration) || 60);
          console.log(`✅ Запуск таймера: ${duration} сек`);
          setTimerDuration(duration);
          setTimerActive(true);
          setStatusText(`Таймер запущен на ${duration} сек.`);
        } else if (
          command?.type === "cancel_timer" ||
          command?.type === "stop_timer"
        ) {
          // Останавливаем таймер по голосовой команде.
          console.log(`🛑 Остановка таймера`);
          setTimerActive(false);
          setTimerDuration(0);
          setStatusText("Таймер остановлен");
        }
      });

      assistant.on("ready", () => {
        console.log("✅ Ассистент готов");
      });

      assistant.on("error", (err) => {
        console.error("❌ Ошибка ассистента:", err?.message);
      });
    } catch (e) {
      console.error("❌ Ошибка инициализации:", e.message);
    }

    return () => {
      assistantInitialized.current = false;
    };
  }, []);

  // Обработка завершения таймера
  const handleTimerFinish = () => {
    console.log("🔔 Таймер завершился");
    setTimerActive(false);
    setStatusText("Время истекло!");
    try {
      // Отправляем событие сценарию, чтобы ассистент озвучил завершение.
      assistant?.sendData?.({
        action: {
          action_id: "timer_finished",
          parameters: {
            value: "done",
          },
        },
      });
    } catch (e) {
      console.error("⚠️ Ошибка отправки timer_finished:", e.message);
    }
  };

  // Обработка нажатия кнопки СТОП
  const handleStop = () => {
    console.log("🛑 Стоп от пользователя");
    setTimerActive(false);
    setTimerDuration(0);
    setStatusText("Таймер остановлен");
    try {
      // Кнопка СТОП дублирует голосовую команду остановки.
      assistant?.sendData?.({
        action: {
          action_id: "cancel_timer",
        },
      });
    } catch (e) {
      console.error("⚠️ Ошибка отправки cancel_timer:", e.message);
    }
  };

  const runLocalDemoSeconds = (sec) => {
    setTimerDuration(sec);
    setTimerActive(true);
    setStatusText(`Локальный тест UI: ${sec} сек (сценарий не вызывается)`);
  };

  return (
    <div className="app">
      <Timer
        active={timerActive}
        duration={timerDuration}
        onFinish={handleTimerFinish}
        onStop={handleStop}
      />
      <div className="status-text">{statusText}</div>

      {showDevVoiceHint && (
        <div className="dev-assistant-hint" role="note">
          <p>
            <strong>Голоса здесь не будет:</strong> в браузере на localhost нет
            «зелёной» панели Салюта. Возьмите токен эмулятора (кабинет разработчика →
            SmartApp → вкладка «Эмулятор» → ключ), сохраните в{" "}
            <code>.env</code>: <code>REACT_APP_TOKEN=…</code> и перезапустите{" "}
            <code>npm start</code> — появится отладочная панель с вводом/микрофоном.
          </p>
          <p>
            В продакшене (Canvas на платформе) используется{" "}
            <code>createAssistant</code> без токена; голос — на устройстве с Салютом.
          </p>
          <div className="dev-demo-row">
            <span>Проверка только интерфейса:</span>
            <button type="button" className="dev-demo-btn" onClick={() => runLocalDemoSeconds(5)}>
              5 сек
            </button>
            <button type="button" className="dev-demo-btn" onClick={() => runLocalDemoSeconds(30)}>
              30 сек
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

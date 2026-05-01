import React, { useState, useEffect, useRef } from "react";
import { createAssistant } from "@salutejs/client";
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

let assistant = null;

// Универсально извлекаем команду от сценария из разных форматов события SDK.
function extractCommand(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  const variants = [
    event.smart_app_data,
    event.action?.smart_app_data,
    event.action,
    event.server_action,
    event.command,
    event.payload?.smart_app_data,
    event.payload?.action,
    event.items?.[0]?.command,
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

  // Инициализация ассистента для работы со сценарием SmartApp Code
  useEffect(() => {
    if (assistantInitialized.current) {
      return;
    }
    assistantInitialized.current = true;

    try {
      // Используем createAssistant - он взаимодействует со сценарием на бэкенде
      assistant = createAssistant({ getState });

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

  return (
    <div className="app">
      <Timer
        active={timerActive}
        duration={timerDuration}
        onFinish={handleTimerFinish}
        onStop={handleStop}
      />
      <div className="status-text">{statusText}</div>
    </div>
  );
}

export default App;

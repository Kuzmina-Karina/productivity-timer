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

function App() {
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
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

        const smartAppData =
          event?.smart_app_data ||
          event?.action ||
          event?.server_action ||
          event?.items?.[0]?.command;

        if (smartAppData?.type === "set_timer") {
          // Запуск таймера от сценария
          const duration = Number(smartAppData.duration) || 60;
          console.log(`✅ Запуск таймера: ${duration} сек`);
          setTimerDuration(duration);
          setTimerActive(true);
        } else if (
          smartAppData?.type === "cancel_timer" ||
          smartAppData?.type === "stop_timer"
        ) {
          // Остановка таймера от сценария
          console.log(`🛑 Остановка таймера`);
          setTimerActive(false);
          setTimerDuration(0);
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
    try {
      // Отправляем событие сценарию что таймер завершился
      assistant?.sendData?.({
        action: {
          action_id: "timer_finished",
          parameters: { value: "done" },
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
    try {
      // Отправляем команду сценарию
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
    </div>
  );
}

export default App;

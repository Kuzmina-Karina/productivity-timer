import React from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";

import "./App.css";
import { Timer } from "./components/Timer";

// --- Инициализация ассистента Salute ---
const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: "",
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }
  return createAssistant({ getState });
};

export class App extends React.Component {
  constructor(props) {
    super(props);

    // Единственное состояние — данные активного таймера (или null)
    this.state = {
      timer: null,
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    // --- Обработка входящих событий от ассистента ---
    this.assistant.on("data", (event) => {
      console.log("assistant.on(data)", event);
      if (event.type === "character" || event.type === "insets") return;
      const { action } = event;
      if (action) this.dispatchAssistantAction(action);
    });

    this.assistant.on("start", (event) => {
      console.log("assistant.on(start)", event);
    });

    this.assistant.on("error", (event) => {
      console.log("assistant.on(error)", event);
    });

    // Подавляем ошибку applicationId из @salutejs/client (баг библиотеки),
    // чтобы CRA error overlay не блокировал UI
    window.addEventListener("error", (e) => {
      if (e.error?.message?.includes("applicationId")) {
        console.warn("Suppressed @salutejs/client error:", e.error.message);
        e.preventDefault();
      }
    });
    window.addEventListener("unhandledrejection", (e) => {
      if (e.reason?.message?.includes("applicationId")) {
        console.warn("Suppressed @salutejs/client rejection:", e.reason.message);
        e.preventDefault();
      }
    });
  }

  // --- Состояние для ассистента (item_selector) ---
  getStateForAssistant() {
    return {
      item_selector: {
        items: [],
        ignored_words: [
          "таймер", "запусти", "поставь", "установи", "включи", "заведи",
          "останови", "отмени", "выключи", "сбрось", "стоп", "хватит",
          "минут", "минуты", "минуту", "секунд", "секунды", "секунду",
        ],
      },
    };
  }

  // --- Диспетчер голосовых команд ---
  dispatchAssistantAction(action) {
    console.log("dispatchAssistantAction", action);
    switch (action.type) {
      case "set_timer":
        return this.setTimer(action);
      case "cancel_timer":
        return this.cancelTimer();
      default:
        console.log("unknown action:", action.type);
    }
  }

  // --- Запуск таймера ---
  setTimer(action) {
    console.log("setTimer", action);
    const duration = action.duration || 60;
    this.setState({
      timer: {
        duration,
        startedAt: Date.now(),
      },
    });
  }

  // --- Остановка таймера вручную или голосом ---
  cancelTimer() {
    console.log("cancelTimer");
    this.setState({ timer: null });
  }

  // --- Таймер истёк: звук + голосовой ответ + сброс ---
  timerEnd() {
    console.log("timerEnd");
    this.playTimerSound();
    this.sendToAssistant("timer_done", "Время вышло!");
    this.setState({ timer: null });
  }

  // --- Отправка server_action ассистенту ---
  sendToAssistant(actionId, value) {
    try {
      const data = {
        action: {
          action_id: actionId,
          parameters: { value },
        },
      };
      const unsubscribe = this.assistant.sendData(data, (resp) => {
        console.log("sendData callback:", resp);
        unsubscribe();
      });
    } catch (e) {
      console.warn("sendToAssistant error:", e);
    }
  }

  // --- Звуковой сигнал через Web Audio API (без внешних файлов) ---
  playTimerSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beep = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
        osc.start(start);
        osc.stop(start + dur);
      };
      // Три коротких сигнала: бип — бип — бииип
      const t = ctx.currentTime;
      beep(880, t, 0.2);
      beep(880, t + 0.3, 0.2);
      beep(1100, t + 0.6, 0.5);
    } catch (e) {
      console.warn("playTimerSound error:", e);
    }
  }

  render() {
    return (
      <div className="app">
        <Timer
          timer={this.state.timer}
          onTimerEnd={() => this.timerEnd()}
          onTimerCancel={() => this.cancelTimer()}
          onTimerStart={(seconds) => this.setTimer({ duration: seconds })}
        />
      </div>
    );
  }
}

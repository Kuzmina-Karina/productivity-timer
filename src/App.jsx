import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import './App.css';

// Эта переменная лечит ошибку краша при голосовом ответе ассистента.
window.appInitialData = [
  {
    app_info: {
      applicationId: "pomodoro-timer-app",
    }
  }
];

const MODES = {
  pomodoro_light: { label: 'Помодоро Лайт', seconds: 1500 },
  pomodoro_medium: { label: 'Помодоро Медиум', seconds: 2700 },
  pomodoro_hard: { label: 'Помодоро Хард', seconds: 3600 },
  exercise: { label: 'Зарядка', seconds: 1200 },
  gym: { label: 'Зал', seconds: 120 },
};

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
};

const parseDuration = (phrase) => {
  if (!phrase) return 60;
  const text = phrase.toLowerCase();
  const match = text.match(/\d+/);
  
  if (match) {
    let val = parseInt(match[0], 10);
    if (text.includes('минут')) return val * 60;
    if (text.includes('час')) return val * 3600;
    return val;
  }
  return 60;
};

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Говорите!',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  } else {
    return createAssistant({ getState });
  }
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor initialized');

    this.state = {
      remainingSeconds: 0,
      status: STATUS.IDLE,
      currentMode: '',
      customInput: '',
    };

    this.timerInterval = null;
    this.alarmTimeout = null; // Таймер для выключения звука через 3 сек
    
    // Электронный классический звук будильника
    this.alarm = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      console.log(`assistant.on(data)`, event);
      
      if (event.type === 'character') {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === 'insets') {
        console.log(`assistant.on(data): insets`);
      } else {
        const action = event.smart_app_data || event.action;
        if (action) {
          this.dispatchAssistantAction(action);
        }
      }
    });

    this.assistant.on('start', (event) => {
      console.log(`assistant.on(start)`, event);
    });
  }

  getStateForAssistant() {
    return {
      item_selector: {
        items: []
      }
    };
  }

  dispatchAssistantAction(action) {
    console.log('dispatchAssistantAction', action);
    switch (action.type) {
      case 'start_mode':
        const mode = MODES[action.mode];
        if (mode) this.startTimer(mode.seconds, mode.label);
        break;
      case 'start_custom_timer':
        const sec = parseDuration(action.phrase);
        this.startTimer(sec, 'Свой таймер');
        break;
      case 'stop_timer':
        this.stopTimer();
        break;
      case 'pause_timer':
        this.pauseTimer();
        break;
      case 'resume_timer':
        this.resumeTimer();
        break;
      default:
        break;
    }
  }

  // Вспомогательная функция для полной остановки звука
  stopAlarmSound = () => {
    this.alarm.pause();
    this.alarm.currentTime = 0;
    this.alarm.loop = false;
    if (this.alarmTimeout) {
      clearTimeout(this.alarmTimeout);
      this.alarmTimeout = null;
    }
  };

  startTimer = (seconds, label) => {
    this.stopAlarmSound();
    this.setState({ remainingSeconds: seconds, currentMode: label, status: STATUS.RUNNING });
    this.startInterval();
  };

  stopTimer = () => {
    this.stopAlarmSound();
    this.setState({ remainingSeconds: 0, currentMode: '', status: STATUS.IDLE });
    this.stopInterval();
  };

  pauseTimer = () => {
    this.setState({ status: STATUS.PAUSED });
    this.stopInterval();
  };

  resumeTimer = () => {
    if (this.state.remainingSeconds > 0) {
      this.setState({ status: STATUS.RUNNING });
      this.startInterval();
    }
  };

  startInterval = () => {
    this.stopInterval();
    this.timerInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.remainingSeconds <= 1) {
          this.stopInterval();
          
          // ЗАПУСКАЕМ ЗВУК РОВНО НА 3 СЕКУНДЫ
          this.alarm.loop = true; // Зацикливаем
          this.alarm.play();
          
          this.alarmTimeout = setTimeout(() => {
            this.stopAlarmSound(); // Вырубаем через 3 сек
          }, 3000); 

          return { remainingSeconds: 0, status: STATUS.IDLE };
        }
        return { remainingSeconds: prevState.remainingSeconds - 1 };
      });
    }, 1000);
  };

  stopInterval = () => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  };

  componentWillUnmount() {
    this.stopInterval();
    this.stopAlarmSound();
  }

  formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  render() {
    const { remainingSeconds, status, currentMode, customInput } = this.state;

    return (
      <main className="app-container">
        <div className="card">
          <h1 className="title">Таймер Помодоро</h1>
          
          <div className="status-container">
             {currentMode ? <p className="mode-label">{currentMode}</p> : <p className="mode-label">Режим не выбран</p>}
          </div>
          
          <div className={`timer-display ${status === STATUS.RUNNING ? 'pulse' : ''}`}>
            {this.formatTime(remainingSeconds)}
          </div>

          <div className="controls">
            {status === STATUS.RUNNING ? (
              <button className="btn btn-pause" onClick={this.pauseTimer}>ПАУЗА</button>
            ) : (
              <button 
                className="btn btn-start" 
                disabled={remainingSeconds === 0 && status !== STATUS.PAUSED}
                onClick={this.resumeTimer}
              >
                {status === STATUS.PAUSED ? 'ПРОДОЛЖИТЬ' : 'СТАРТ'}
              </button>
            )}
            <button className="btn btn-reset" onClick={this.stopTimer} disabled={remainingSeconds === 0 && status === STATUS.IDLE}>СБРОС</button>
          </div>

          <hr className="divider" />

          <div className="manual-controls">
            <div className="preset-grid">
              {Object.entries(MODES).map(([key, mode]) => (
                <button key={key} className="btn-preset" onClick={() => this.startTimer(mode.seconds, mode.label)}>
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="custom-box">
              <input
                type="number"
                value={customInput}
                onChange={(e) => this.setState({ customInput: e.target.value })}
                placeholder="Секунды"
                className="custom-input"
              />
              <button 
                className="btn-custom-start" 
                onClick={() => {
                  const secs = parseInt(customInput);
                  if (secs > 0) this.startTimer(secs, 'Свой таймер');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
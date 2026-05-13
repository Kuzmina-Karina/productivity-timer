import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import './App.css';

// ✅ Твоя правильная структура для @salutejs/client
window.appInitialData = [
  {
    type: 'insets',
    insets: { left: 0, right: 0, top: 0, bottom: 0 }
  },
  {
    type: 'character',
    character: { id: 'sber' }
  },
  {
    app_info: {
      applicationId: "pomodoro-timer-app",
      appversionId: "1.0.0",
      frontendEndpoint: "None",
      frontendType: "web",
      projectId: import.meta.REACT_APP_PROJECT_ID || "pomodoro-project"
    },
    device_id: "web-device",
    platform: "web",
    sdk_version: "1.0.0"
  }
];

// ✅ Вернули нормальное время в секундах (1500 = 25 минут, 300 = 5 минут и т.д.)
const MODES = {
  pomodoro_light: { 
    label: 'Помодоро Лайт', 
    seconds: 15,        
    breakSeconds: 10,   
    isCycle: true 
  },
  pomodoro_medium: { 
    label: 'Помодоро Медиум', 
    seconds: 2700, 
    breakSeconds: 600,
    isCycle: true 
  },
  pomodoro_hard: { 
    label: 'Помодоро Хард', 
    seconds: 3600, 
    breakSeconds: 900,
    isCycle: true 
  },
  exercise: { label: 'Зарядка', seconds: 1200 },
  gym: { label: 'Зал', seconds: 120 },
};

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
};

const initializeAssistant = (getState) => {
  // Проверяем, запущены ли мы в среде Salute
  const isSaluteEnv = typeof window !== 'undefined' && window.AssistantHost;
  
  if (!isSaluteEnv || import.meta.env.DEV) {
    // Локальная разработка: используем дебаггер с фолбэком
    try {
      return createSmartappDebugger({
        token: import.meta.env.VITE_TOKEN ?? '',
        initPhrase: `Запусти ${import.meta.env.VITE_SMARTAPP ?? 'Таймер Помодоро'}`,
        getState,
        nativePanel: {
          defaultText: 'Говорите!',
          screenshotMode: false,
          tabIndex: -1,
        },
      });
    } catch (e) {
      console.warn('SmartApp Debugger не доступен, используем mock-ассистента');
      // Возвращаем минимальный мок-ассистент, чтобы приложение не падало
      return {
        on: () => {},
        sendData: () => {},
        sendText: () => {},
        close: () => {},
        ready: () => {},
      };
    }
  }
  
  // Продакшен в среде Salute
  return createAssistant({ getState });
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor initialized');

    this.state = {
      remainingSeconds: 0,
      status: STATUS.IDLE,
      currentMode: '',
      isCycleMode: false,
      currentPhase: 'work',
      baseModeKey: '',
      // Ручной ввод убран
    };

    this.timerInterval = null;
    this.alarmTimeout = null; 
    
    // Ссылки для анимации круга и помидора
    this.circleRef = React.createRef();
    this.tomatoRef = React.createRef();
    this.totalSeconds = 0; 
    this.circumference = 691.15; 
    
    // Классический звук будильника
    this.alarm = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    this.alarm.volume = 0.8; 
    this.alarm.preload = 'auto';

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      console.log(`assistant.on(data)`, event);
      
      const action = event.smart_app_data || event.action;
      if (action) {
        this.dispatchAssistantAction(action);
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
        if (mode) {
          const label = mode.isCycle ? `${mode.label}: Работа` : mode.label;
          this.startTimer(mode.seconds, label, action.mode, 'work');
        }
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
    try {
      this.alarm.pause();
      this.alarm.currentTime = 0;
      this.alarm.loop = false;
      if (this.alarmTimeout) {
        clearTimeout(this.alarmTimeout);
        this.alarmTimeout = null;
      }
    } catch (e) {
      console.warn("Ошибка при остановке звука:", e);
    }
  };

  speakAnnouncement = (phase) => {
    if (this.assistant) {
      const actionId = phase === 'work' ? 'announcement_work_start' : 'announcement_break_start';
      this.assistant.sendData({
        action: {
          action_id: actionId
        }
      });
    }
  };

  startTimer = (seconds, label, modeKey = null, phase = 'work') => {
    this.stopAlarmSound();
    this.totalSeconds = seconds;

    const mode = modeKey ? MODES[modeKey] : null;
    const isCycle = mode?.isCycle || false;

    // Сброс кольца (пустое) и помидора (маленький)
    if (this.circleRef.current) {
      this.circleRef.current.style.strokeDashoffset = this.circumference;
    }
    if (this.tomatoRef.current) {
      this.tomatoRef.current.style.transform = 'scale(0.2)';
      this.tomatoRef.current.style.opacity = '0.2';
    }

    this.setState({ 
      remainingSeconds: seconds, 
      currentMode: label, 
      status: STATUS.RUNNING,
      isCycleMode: isCycle,
      currentPhase: phase,
      baseModeKey: modeKey || ''
    });
    
    this.startInterval();
  };

  stopTimer = () => {
    this.stopAlarmSound();
    
    // ✅ ИСПРАВЛЕНИЕ: Откатываем прогресс-бар в начало при сбросе/стопе
    if (this.circleRef.current) {
      this.circleRef.current.style.strokeDashoffset = this.circumference;
    }
    if (this.tomatoRef.current) {
      this.tomatoRef.current.style.transform = 'scale(0.2)';
      this.tomatoRef.current.style.opacity = '0.2';
    }

    this.setState({ 
      remainingSeconds: 0, 
      currentMode: '', 
      status: STATUS.IDLE,
      isCycleMode: false,
      currentPhase: 'work',
      baseModeKey: '' 
    });
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
          
          // Полностью заполняем графику в самом конце
          if (this.circleRef.current) {
            this.circleRef.current.style.strokeDashoffset = 0;
          }
          if (this.tomatoRef.current) {
            this.tomatoRef.current.style.transform = 'scale(1)';
            this.tomatoRef.current.style.opacity = '1';
          }

          // Включаем звук будильника
          this.alarm.loop = true;
          try {
            const playPromise = this.alarm.play();
            if (playPromise !== undefined) {
               playPromise.catch(() => console.warn("Браузер заблокировал автоплей"));
            }
          } catch(e) {}
          
          this.alarmTimeout = setTimeout(() => {
            this.stopAlarmSound();
          }, 3000); 

          // ✅ ЛОГИКА ЦИКЛОВ ПОМОДОРО: Работа -> Перерыв -> Работа
          if (prevState.isCycleMode && prevState.baseModeKey) {
            const mode = MODES[prevState.baseModeKey];
            const nextPhase = prevState.currentPhase === 'work' ? 'break' : 'work';
            const nextSeconds = nextPhase === 'work' ? mode.seconds : mode.breakSeconds;
            const phaseLabel = nextPhase === 'work' ? 'Работа' : 'Перерыв';
            const nextLabel = `${mode.label}: ${phaseLabel}`;
            
            // Ждем 3.2 секунды (пока проиграет звук будильника), затем меняем цикл
            setTimeout(() => {
              // Озвучиваем переход голосом Сбера
              this.speakAnnouncement(nextPhase);
              
              // Запускаем следующий цикл
              this.startTimer(nextSeconds, nextLabel, prevState.baseModeKey, nextPhase);
            }, 3200); 
            
            // Пока ждем эти 3 секунды, таймер в IDLE (ноль)
            return { remainingSeconds: 0, status: STATUS.IDLE };
          }

          // Если это обычный таймер (например, Зал или Зарядка) - просто останавливаемся
          return { remainingSeconds: 0, status: STATUS.IDLE, currentMode: '' };
        }

        // Анимация кольца и помидора во время работы таймера
        if (this.totalSeconds > 0) {
          const progressedSeconds = this.totalSeconds - (prevState.remainingSeconds - 1);
          const progress = progressedSeconds / this.totalSeconds; 
          
          // Круг заполняется (от полного circumference до 0)
          if (this.circleRef.current) {
            const offset = this.circumference - (progress * this.circumference);
            this.circleRef.current.style.strokeDashoffset = offset;
          }

          // Помидор растет от 0.2 до 1
          if (this.tomatoRef.current) {
            const growthFactor = Math.min(1, 0.2 + progress * 0.8);
            this.tomatoRef.current.style.transform = `scale(${growthFactor})`;
            this.tomatoRef.current.style.opacity = `${growthFactor}`;
          }
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
    const { remainingSeconds, status, currentMode, currentPhase } = this.state;

    return (
      <main className="app-container">
        <div className="card">
          <h1 className="title">Таймер Помодоро</h1>
          
          <div className="status-container">
             {currentMode ? <p className="mode-label">{currentMode}</p> : <p className="mode-label">Режим не выбран</p>}
          </div>
          
          <div className="timer-wrapper">
            <svg className="progress-ring" width="240" height="240">
              <circle stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" fill="transparent" r="110" cx="120" cy="120" />
              <circle 
                className="progress-ring__circle" 
                stroke={currentPhase === 'work' ? '#00ff7f' : '#2196F3'} 
                strokeWidth="8" 
                fill="transparent" 
                r="110" cx="120" cy="120" 
                ref={this.circleRef} 
              />
            </svg>
            
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1202/1202125.png" 
              alt="Помидор" 
              className="tomato-img" 
              ref={this.tomatoRef} 
            />

            <div className={`timer-display ${status === STATUS.RUNNING ? 'pulse' : ''}`}>
              {this.formatTime(remainingSeconds)}
            </div>
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
                <button 
                  key={key} 
                  className="btn-preset" 
                  onClick={() => {
                    const label = mode.isCycle ? `${mode.label}: Работа` : mode.label;
                    this.startTimer(mode.seconds, label, key, 'work');
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {/* Блок кастомного ввода полностью удален */}
          </div>
        </div>
      </main>
    );
  }
}
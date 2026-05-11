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

// ВРЕМЕННО: Я установил время в Помодоро Лайт по 10 секунд (работы и перерыва)
// для быстрого тестирования. Потом я верну тебе нормальные 25 минут.
const MODES = {
  pomodoro_light: { label: 'Помодоро Лайт', seconds: 10, breakSeconds: 3, isCycle: true },
  pomodoro_medium: { label: 'Помодоро Медиум', seconds: 2700, breakSeconds: 600, isCycle: true },
  pomodoro_hard: { label: 'Помодоро Хард', seconds: 3600, breakSeconds: 900, isCycle: true },
  exercise: { label: 'Зарядка', seconds: 1200 },
  gym: { label: 'Зал', seconds: 120 },
};

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
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
      isCycleMode: false, // Флаг, что мы в Pomodoro-цикле
      currentPhase: 'work', // work или break
      baseModeKey: '', // Сохраняем ключ режима для циклов
    };

    this.timerInterval = null;
    this.alarmTimeout = null; 
    
    // Ссылки для анимации круга и помидора
    this.circleRef = React.createRef();
    this.tomatoRef = React.createRef();
    this.totalSeconds = 0; 
    
    // Длина окружности (2 * Math.PI * radius). При радиусе 110 это ~691.15
    this.circumference = 691.15; 
    
    // Электронный классический звук будильника
    this.alarm = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');

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
          // Если это цикличный Pomodoro, лейбл будет другим
          const label = mode.isCycle ? `${mode.label}: Работа` : mode.label;
          this.startTimer(mode.seconds, label, action.mode);
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
    } catch (e) {}
  };

  startTimer = (seconds, label, modeKey = null) => {
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
      currentPhase: 'work', // Всегда начинаем с работы
      baseModeKey: modeKey || '' // Сохраняем ключ для циклов
    });
    this.startInterval();
  };

  stopTimer = () => {
    this.stopAlarmSound();
    // ✅ ИСПРАВЛЕНО: Сброс кольца прогресс-бара к началу (пустое)
    if (this.circleRef.current) {
      this.circleRef.current.style.strokeDashoffset = this.circumference;
    }
    // ✅ Убеждаемся, что помидор тоже сбрасывается
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
          
          // Полностью заполняем в конце
          if (this.circleRef.current) {
            this.circleRef.current.style.strokeDashoffset = 0;
          }
          if (this.tomatoRef.current) {
            this.tomatoRef.current.style.transform = 'scale(1)';
            this.tomatoRef.current.style.opacity = '1';
          }

          this.alarm.loop = true; // Зацикливаем
          try {
            const playPromise = this.alarm.play();
            if (playPromise !== undefined) {
               playPromise.catch(() => console.warn("Звук заблокирован (нужен клик)"));
            }
          } catch(e) {}
          
          // Рингтон играет 3 секунды, затем выключается
          this.alarmTimeout = setTimeout(() => {
            this.stopAlarmSound(); 
          }, 3000); 

          // ✅ НОВАЯ ЛОГИКА: Переход фаз Pomodoro (РАБОТА <-> ПЕРЕРЫВ)
          if (prevState.isCycleMode && prevState.baseModeKey) {
            const mode = MODES[prevState.baseModeKey];
            const nextPhase = prevState.currentPhase === 'work' ? 'break' : 'work';
            const nextSeconds = nextPhase === 'work' ? mode.seconds : mode.breakSeconds;
            const phaseLabel = nextPhase === 'work' ? 'Работа' : 'Перерыв';
            const nextLabel = `${mode.label}: ${phaseLabel}`;
            
            // ✅ ГОЛОСОВОЕ ОБЪЯВЛЕНИЕ ЧЕРЕЗ СЦЕНАРИЙ (с родным сигналом)
            if (this.assistant) {
              let actionId = null;
              if (nextPhase === 'work') {
                actionId = 'announcement_work_start'; // Перерыв закончился, время работать
              } else if (nextPhase === 'break') {
                actionId = 'announcement_break_start'; // Время перерыва
              }
              
              if (actionId) {
                // Это отправит SERVER_ACTION, который мы перехватим в timer.sc
                this.assistant.sendData({
                  type: "server_action",
                  message_name: "SERVER_ACTION",
                  server_action: {
                    action_id: actionId
                  }
                });
              }
            }
            
            // Подготавливаем таймер и графику к следующему циклу
            this.totalSeconds = nextSeconds;
            if (this.circleRef.current) {
              this.circleRef.current.style.strokeDashoffset = this.circumference;
            }
            if (this.tomatoRef.current) {
              this.tomatoRef.current.style.transform = 'scale(0.2)';
              this.tomatoRef.current.style.opacity = '0.2';
            }

            // Устанавливаем данные для следующего цикла и запускаем
            return {
              remainingSeconds: nextSeconds,
              currentMode: nextLabel,
              currentPhase: nextPhase,
              status: STATUS.RUNNING
            };
          }

          // Если это обычный таймер, просто останавливаемся
          return { remainingSeconds: 0, status: STATUS.IDLE };
        }

        // Анимация кольца и помидора во время работы таймера
        if (this.totalSeconds > 0) {
          const progressedSeconds = this.totalSeconds - (prevState.remainingSeconds - 1);
          const progress = progressedSeconds / this.totalSeconds; // от 0 до 1
          
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
    const { remainingSeconds, status, currentMode } = this.state;

    return (
      <main className="app-container">
        <div className="card">
          <h1 className="title">Таймер Помодоро</h1>
          
          <div className="status-container">
             {currentMode ? <p className="mode-label">{currentMode}</p> : <p className="mode-label">Режим не выбран</p>}
          </div>
          
          {/* НОВЫЙ КРУГЛЫЙ ЦИФЕРБЛАТ С ПОМИДОРОМ */}
          <div className="timer-wrapper">
            <svg className="progress-ring" width="240" height="240">
              {/* Фоновое тусклое кольцо */}
              <circle stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" fill="transparent" r="110" cx="120" cy="120" />
              {/* Активное яркое кольцо */}
              <circle 
                className="progress-ring__circle" 
                stroke="#00ff7f" 
                strokeWidth="8" 
                fill="transparent" 
                r="110" cx="120" cy="120" 
                ref={this.circleRef} 
              />
            </svg>
            
            {/* Стилизованный помидор из image_7.png */}
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
                    // Явная логика запуска циклов Pomodoro
                    const label = mode.isCycle ? `${mode.label}: Работа` : mode.label;
                    this.startTimer(mode.seconds, label, key);
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* ✅ УБРАНО: Поле ручного ввода секунд и кнопка "OK" */}
          </div>
        </div>
      </main>
    );
  }
}
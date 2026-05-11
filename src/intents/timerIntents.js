// Конфигурация интентов для SmartApp Studio.
// Можно импортировать в server-side сценарий или использовать как шаблон для JSON.
export const timerIntents = {
  intents: [
    {
      name: 'start_mode',
      description: 'Запуск предустановленного режима таймера',
      slots: [{ name: 'mode', type: 'mode', required: true }],
      examples: [
        'Запусти помодоро лайт',
        'Включи помодоро медиум',
        'Старт хард помодоро',
        'Запусти зарядку',
        'Таймер на две минуты для зала',
      ],
      actions: [{ type: 'start_mode', mode: '$mode' }],
    },
    {
      name: 'start_custom_timer',
      description: 'Запуск таймера с длительностью из естественной фразы',
      slots: [{ name: 'duration_phrase', type: 'rawText', required: true }],
      examples: [
        'Запусти таймер на тридцать секунд',
        'Запусти таймер на 45 секунд',
        'Таймер на пятнадцать минут',
        'Запусти таймер на две минуты',
        'Таймер на шестьдесят секунд',
      ],
      actions: [{ type: 'start_custom_timer', phrase: '$duration_phrase' }],
    },
    {
      name: 'stop_timer',
      description: 'Остановка таймера',
      examples: ['Останови таймер', 'Стоп', 'Прекрати отсчёт'],
      actions: [{ type: 'stop_timer' }],
    },
    {
      name: 'pause_timer',
      description: 'Пауза таймера',
      examples: ['Пауза', 'Поставь на паузу'],
      actions: [{ type: 'pause_timer' }],
    },
    {
      name: 'resume_timer',
      description: 'Продолжение таймера после паузы',
      examples: ['Продолжить', 'Продолжай отсчёт'],
      actions: [{ type: 'resume_timer' }],
    },
  ],
  dictionary: {
    // Словарь связывает канонические mode-значения и голосовые синонимы.
    mode: {
      pomodoro_light: ['помодоро лайт', 'лайт помодоро'],
      pomodoro_medium: ['помодоро медиум', 'медиум помодоро'],
      pomodoro_hard: ['помодоро хард', 'хард помодоро'],
      exercise: ['зарядка', 'зарядку'],
      gym: ['зал', 'для зала'],
    },
  },
};

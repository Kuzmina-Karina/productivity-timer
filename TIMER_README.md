# Salute Canvas App: Голосовой таймер

Полнофункциональное приложение для управления таймером голосом через ассистента Salute с минималистичным визуальным интерфейсом.

## 📋 Структура проекта

```
todo-canvas-app/
├── src/
│   ├── App.jsx                    # Главный компонент с интеграцией Salute SDK
│   ├── App.css                    # Стили интерфейса таймера
│   ├── index.jsx                  # Точка входа
│   ├── index.css                  # Глобальные стили
│   └── components/
│       └── Timer.jsx              # Компонент таймера (отсчет + звук)
├── public/
│   └── index.html                 # HTML страница
├── package.json                   # Зависимости
├── smartapp.json                  # Конфигурация голосовых интентов
└── README.md                      # Этот файл
```

## 🎯 Функциональность

### Голосовые команды

1. **Запуск таймера на указанное время:**
   - "Запусти таймер на 30 секунд"
   - "Включи таймер на 5 минут"
   - "Таймер на две минуты"
   - "На 60 секунд"

2. **Остановка/отмена:**
   - "Останови таймер"
   - "Стоп"
   - "Прекрати отсчет"
   - "Выключи таймер"

### Визуальный интерфейс

- **Циферблат с секундомером** (HH:MM:SS) в центре экрана
- **Кнопка СТОП** для ручной остановки (красная, активна только при работающем таймере)
- **Индикаторы состояния:**
  - Синее свечение — таймер работает
  - Красное пульсирующее свечение — время истекло
- **Звуковой сигнал** при завершении (три коротких гудка)
- **Текстовое уведомление** "Время истекло!"

### Мобильная поддержка

- Адаптивный дизайн для всех разрешений
- Контроль фонового режима (таймер продолжит работать при минимизации)
- Оптимизирован для Canvas Apps и Salute Display

## 🚀 Быстрый старт

### Установка и запуск в режиме разработки

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm start

# Сборка production-версии
npm run build
```

Приложение будет доступно на `http://localhost:3000`

## 🔊 Интеграция с Salute

### SDK Configuration

App используется официальный SDK `@salutejs/client` версии 1.32.0:

```javascript
import { createAssistant, createSmartappDebugger } from "@salutejs/client";

// Production
const assistant = createAssistant({ getState });

// Development (SmartApp Studio)
const assistant = createSmartappDebugger({
  token: process.env.REACT_APP_TOKEN,
  getState,
  initPhrase: "запусти таймер",
  nativePanel: { defaultText: "Команда таймера...", screenshotMode: false },
  appInitialData: [{ app_info: appInfo }],
});
```

### Обработка команд

App слушает события `data` от ассистента:

```javascript
assistant.on("data", (event) => {
  const action = event?.action || event?.smart_app_data || /* ... */;
  
  if (action?.type === "set_timer") {
    const duration = Number(action.duration);
    setTimerDuration(duration);
    setTimerActive(true);
  }
});
```

### Отправка результатов

При завершении таймера app отправляет:

```javascript
assistant?.sendData?.({
  action: {
    action_id: "timer_finished",
    parameters: { value: "done" },
  },
});
```

## 🎨 Палитра и дизайн

| Элемент | Цвет | Состояние |
|---------|------|----------|
| Фон | `#0a0a1a` | Темно-фиолетовый градиент |
| Числа (idle) | `rgba(255,255,255,0.2)` | Серый |
| Числа (active) | `#ffffff` | Белый |
| Числа (done) | `#ef4444` | Красный + пульс |
| Кольцо (active) | `rgba(99,102,241,0.6)` | Индиго свечение |
| Кольцо (done) | `rgba(239,68,68,0.7)` | Красное пульсирующее |
| Кнопка СТОП | Градиент красный | `#ef4444 → #dc2626` |

## 🔧 Технические заметки

### Особенности Canvas Apps

1. **Безопасность контекста:**
   - `appInfo` определена на уровне модуля (вне компонента)
   - `getState()` всегда возвращает нормализованный объект
   - Защита от двойной инициализации через `useRef`

2. **Работа звука:**
   - Используется Web Audio API (OscillatorNode)
   - 3 импульса на частоте 880 Гц
   - Автоматически отключается, если звук недоступен

3. **Фоновый режим:**
   - Таймер работает даже при минимизации приложения
   - `Date.now()` используется для точности в фоне
   - Восстанавливается корректно при возврате из фона

4. **React StrictMode:**
   - Dev mode может вызвать двойную инициализацию
   - Используется флаг `assistantInitialized` для защиты

### Отладка в SmartApp Studio

1. Откройте SmartApp Studio
2. Создайте новый проект типа "Canvas App"
3. Загрузите код из папки `src/`
4. В `.env` файле установите:
   ```
   REACT_APP_TOKEN=your_debug_token
   REACT_ENV=development
   ```

5. Используйте панель "Отладка" для отправки тестовых команд

### Парсинг времени

Бэкенд должен парсить фразы вида:
- "30 секунд" → `{ duration: 30 }` (в секундах)
- "5 минут" → `{ duration: 300 }` (преобразованы в секунды)
- "две минуты" → парсинг текста в числа

## 📦 Зависимости

- **react** 18.2.0 — UI фреймворк
- **react-dom** 18.2.0 — React DOM
- **@salutejs/client** 1.32.0 — SDK Salute
- **styled-components** 6.1.8 — CSS-in-JS (если потребуется)
- **react-scripts** 5.0.1 — CRA tooling
- **typescript** 5.4.5 — Type checking

## 🛡️ Обработка ошибок

App корректно обрабатывает:
- Ошибки инициализации ассистента (try-catch)
- Недоступность Web Audio API (звук)
- Отсутствие method `sendData` (optional chaining)
- Некорректные структуры данных от ассистента

## 📱 Поддерживаемые устройства

- ✅ Salute OS (Smart Hub)
- ✅ Android с Salute Assistant
- ✅ iOS с Safari
- ✅ Windows/Mac в браузере (для тестирования)
- ✅ SmartApp Studio (режим разработки)

## 🔐 Безопасность

- Нет сторонних зависимостей кроме @salutejs/client
- Без обработки личных данных
- Без сетевых запросов (только Salute protocol)
- LocalStorage не используется
- CSP совместим

## 📝 Лицензия

Canvas App для Sber Salute Smart Apps
Version 1.0.0

# Salute Canvas App: Голосовой Таймер ⏱️

Полнофункциональное приложение для управления таймером голосом через ассистента Salute с минималистичным визуальным интерфейсом.

## 🎯 Что это?

Canvas App (веб-приложение на React) для Sber Salute, которое позволяет:
- **Управлять таймером голосом** через помощника Salute
- **Видеть отсчет** в режиме реального времени на экране
- **Получать уведомления** при завершении (звук + текст)
- **Контролировать вручную** через кнопку СТОП

## 🚀 Быстрый старт

### Установка и запуск

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск в режиме разработки
npm start

# 3. Откроется http://localhost:3000
```

### Сборка для production

```bash
npm run build
# Файлы готовы в папке build/ для загрузки в SmartApp Studio
```

## 📋 Структура проекта

```
src/
├── App.jsx                    # Главный компонент + Salute SDK интеграция
├── App.css                    # Стили интерфейса
├── index.jsx                  # Точка входа
├── index.css                  # Глобальные стили
└── components/
    └── Timer.jsx              # Компонент таймера
```

## 🎤 Голосовые команды

### Запуск таймера

```
"Запусти таймер на 30 секунд"
"Включи таймер на 5 минут"
"На две минуты"
"Таймер на 1 минуту"
```

### Остановка

```
"Останови таймер"
"Стоп"
"Выключи таймер"
```

Все команды и примеры тренировки см. в файле `TRAINING_PHRASES.json`

## 🎨 Интерфейс

- **Циферблат** с форматом HH:MM:SS в центре
- **Кнопка СТОП** (красная, активна только при работающем таймере)
- **Индикаторы:**
  - Синее свечение — таймер работает
  - Красное пульсирующее — время истекло
- **Звуковой сигнал** (3 гудка) при завершении
- **Текстовое уведомление** "Время истекло!"

## 📦 Технологии

| Компонент | Версия |
|-----------|--------|
| React | 18.2.0 |
| Salute Client SDK | 1.32.0 |
| TypeScript | 5.4.5 |
| Web Audio API | Стандарт |

## 🔧 Интеграция с Salute

### SDK в App.jsx

```javascript
import { createAssistant, createSmartappDebugger } from "@salutejs/client";

// Development (SmartApp Studio)
const assistant = createSmartappDebugger({
  token: process.env.REACT_APP_TOKEN,
  getState,
  initPhrase: "запусти таймер",
  nativePanel: { defaultText: "Команда таймера..." },
  appInitialData: [{ app_info: appInfo }],
});

// Production
const assistant = createAssistant({ getState });
```

### Обработка команд

```javascript
assistant.on("data", (event) => {
  if (action?.type === "set_timer") {
    const duration = Number(action.duration); // в секундах
    setTimerDuration(duration);
    setTimerActive(true);
  }
});
```

## 📋 Что исправлено в этой версии

✅ **App.jsx** — переписан полностью (была поврежденная версия)
✅ **Конфигурация** — добавлены правильные интенты для Salute
✅ **CSS** — переделан минималистичный дизайн
✅ **Build** — проект собирается без ошибок
✅ **Документация** — полная инструкция по деплою

## 📖 Документация

- **[TIMER_README.md](TIMER_README.md)** — подробное описание функциональности
- **[DEPLOY.md](DEPLOY.md)** — инструкция по деплою в SmartApp Studio
- **[TRAINING_PHRASES.json](TRAINING_PHRASES.json)** — примеры голосовых команд
- **[smartapp.json](smartapp.json)** — конфигурация интентов

## 🔒 Безопасность

- ✅ Без третьих сторон (только @salutejs/client)
- ✅ Без обработки личных данных
- ✅ Без сетевых запросов (только Salute protocol)
- ✅ CSP совместим

## 🐛 Отладка

### В браузере

```javascript
// Console в DevTools (F12)
console.log("Таймер активен:", timerActive);
console.log("Длительность:", timerDuration);
```

### SmartApp Studio

1. Откройте SmartApp Studio
2. Создайте Canvas App проект
3. Загрузите файлы из `build/`
4. Используйте панель отладки для тестирования команд

## ⚙️ Переменные окружения

Создайте `.env` файл:

```env
REACT_APP_TOKEN=your_debug_token_from_smartapp_studio
NODE_ENV=development
```

Пример: [.env.example](.env.example)

## 📱 Поддерживаемые платформы

- Salute OS (Smart Hub)
- Android + Salute Assistant
- iOS (Safari)
- Windows/Mac (браузер для тестирования)
- SmartApp Studio (режим разработки)

## 🚀 Деплой

1. **Подготовка:**
   ```bash
   npm run build
   ```

2. **Загрузка в SmartApp Studio:**
   - Откройте SmartApp Studio
   - Создайте Canvas App
   - Загрузите `build/index.html` и папку `build/static/`

3. **Тестирование:**
   - Используйте SmartApp Debugger для тестирования интентов
   - Говорите: "Запусти таймер на 30 секунд"

Полная инструкция: см. [DEPLOY.md](DEPLOY.md)

## 🔗 Полезные ссылки

- [SmartApp Studio](https://developers.sber.ru/studio/)
- [Salute SDK Документация](https://www.npmjs.com/package/@salutejs/client)
- [Canvas App Guide](https://developers.sber.ru/docs/ru/salute/canvas-app)
- [NLU Интенты](https://developers.sber.ru/docs/ru/salute/nlu)

## 📞 Проблемы и решения

### "Ассистент не готов"
→ Проверьте, что `REACT_APP_TOKEN` указан в `.env`

### "Звук не работает"
→ Браузер может блокировать аудио; разрешите в настройках

### "Интент не распознан"
→ Проверьте TRAINING_PHRASES.json и переобучите NLU в SmartApp Studio

### "Build ошибка"
→ Запустите `npm install` и проверьте Node версию (16+)

## 📄 Лицензия

Canvas App для Sber Salute Smart Apps
Версия: 1.0.0
4. На открывшейся странице - "SmartApp - Информация для каталога, эмулятор, мои устройства"
5. Закладка "Эмулятор";
6. Нажимаем "Обновить ключ";
7. Нажимаем "Скопировать ключ" (Появляется надпись "Выполнено. Ключ скопирован");
8. Указываем токен в файле `.env`, в строке `REACT_APP_TOKEN`.

## Запуск проекта:

Протестировано под Nodejs `18.15.0`.

1. Установить нужную версию Nodejs можно либо непосредственно с сайта, либо (рекомендуется) с помощью утилиты `nvm`, позволяющей быстро переключаться между версиями Node из командной строки (`nvm install 18.15.0`, `nvm use 18.15.0`).
2. Установить менеджер пакетов `yarn`, установить зависимости и запустить:

```bash
npm install -g yarn
yarn
yarn start
```

Если после установки `yarn` при попытке его запустить вы получаете сообщение `The term 'yarn' is not recognized`, см. раздел "Устранение проблем" ниже.

Эти же команды в менеджере пакетов `npm` (уже установлен по умолчанию вместе с Nodejs):

```bash
npm install
npm start
```

Если при запске `npm install` выводится ошибка "Conflicting peer dependency: typescript", см. раздел "Устранение проблем" ниже.



3. Должен открыться веб-браузер со страницей приложения, в котором (кроме обычного визуального интерфейса) в нижней части появится панель Ассистента с шариком слева. Кликом на шарике можно включать/отключать распознавание речи. При отключенном распознавании текст можно вводить с клавиатуры в строке справа от шарика.
   ![doc/screen.png](doc/screen.png)
4. При вращающемся шарике в этом приложении доступны следующие голосовые команды:

- "Добавь "тест",
- "Выполнил "тест",
- "Удали "тест".

Не забудьте разрешить доступ страницы к микрофону.

Если вам не нужно, чтобы новая вкладка браузера открывалась каждый раз при старте приложения, в файле `.env` добавьте строку

```dotenv
BROWSER=none
```

Внимание! При внесении изменений в файл `.env` приложение необходимо перезапустить.

# Документация

## Официальная документация

### Описание Assistant Client

Описание Assistant Client приведено в репозитории https://github.com/salute-developers/salutejs-client

*Обратите внимание: старая страница проекта https://github.com/sberdevices/assistant-client не обновляется.*

*То же с именем модуля NPM: @sberdevices/assistant-client -> '@salutejs/client.*

## Документация developers.sber.ru

- Разработка графического интерфейса: Canvas App -- Создание приложений на JavaScript -- https://developers.sber.ru/docs/ru/va/canvas/title-page
- Разработка голосовой части: Code --  среда разработки на языках JavaScript и SmartApp DSL -- https://developers.sber.ru/docs/ru/va/code/overview

## Поддержка

Чат в телеграмме: https://t.me/smartmarket_community

Заявку можно оставить в чате на сайте developers.sber.ru

## Сторонние статьи

Несколько статей на Хабре (разных лет; как минимум, изменилось название модуля):

- https://habr.com/ru/articles/599493/ (2022 г.)
- https://habr.com/ru/articles/541522/ (2021 г.)

# Устранение проблем

### Не работает озвучка и/или микрофон в браузере

Нужно перейти в [настройки сайта](https://support.google.com/chrome/answer/114662) и разрешить доступ к звуку и микрофону.

Значение параметра Sound по умолчанию; "Automaticv (default)", не позволяет браузеру проигрывать звуки до того, как пользователь совершит какое-то действие. Если вам нужно услышать начальное приветствие сразу после загрузки страницы, это значение неужно изменить на "Allow".

### Проблема

Большое количество сообщений `Failed to parse source map`:

```log
Module Warning (from ./node_modules/source-map-loader/dist/cjs.js):
Failed to parse source map from '(...)\salut-app\node_modules\@salutejs\plasma-typo\src\tokens.ts' file:
Error: ENOENT: no such file or directory, open '(...)\salut-app\node_modules\@salutejs\plasma-typo\src\tokens.ts'
```

### Решение

Это - предупреждающие сообщения и не являются признаком ошибки.
При необходимости их отключить (не рекомендуется), можно добавить в файл `.env` следующую строку:

```dotenv
GENERATE_SOURCEMAP=false
```

Внимание! При внесении изменений в файл `.env` приложение необходимо перезапустить.

## The term 'yarn' is not recognized

### Проблема

Если вы работаете в Windows, и после установки `yarn`, при попытке его запустить, вы получаете сообщение `The term 'yarn' is not recognized`:

```log
yarn : The term 'yarn' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

### Решение

В Windows настоящее время по умолчанию используется командная строка PowerShell. В некоторых случаях PowerShell не может найти команду `yarn` после установки. Наиболее простой способ решить эту проблему - запустить более старый командный процессор Cmd. В нём, как правило, всё работает.
В случае, если это не решает проблему, можно использовать оригинальный менеджер пакетов `npm`.

## "Conflicting peer dependency: typescript" при выполнении команды `npm install`

### Проблема

При выполнении команды для установки пакетов

```
npm install
```

Выводится следующая ошибка:
```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: react-scripts@5.0.1
npm error Found: typescript@5.4.5
npm error node_modules/typescript
npm error   typescript@"=5.4.5" from the root project
npm error
npm error peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1
npm error node_modules/react-scripts
npm error   react-scripts@"5.0.1" from the root project
npm error
npm error Conflicting peer dependency: typescript@4.9.5
npm error node_modules/typescript
npm error   peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1
npm error   node_modules/react-scripts
npm error     react-scripts@"5.0.1" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error C:\Users\alykoshin\AppData\Local\npm-cache\_logs\2025-03-29T19_07_40_891Z-eresolve-report.txt
npm error A complete log of this run can be found in: C:\Users\alykoshin\AppData\Local\npm-cache\_logs\2025-03-29T19_07_40_891Z-debug-0.log
PS D:\teach\11. webdev - все материалы\05. МИСиС. 1.02. Разр.кл.-серв.прил. - 2025\Проекты для консультаций\todo-canvas-app> npm i --force
```
### Решение

Запустить `npm i` с ключом `--force`
```
npm i --force
```

Или использовать команду `yarn`, если она была установлена.

```
yarn
```


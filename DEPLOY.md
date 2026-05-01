# Деплой Canvas App на Salute

## Краткая инструкция для SmartApp Studio

### 1. Подготовка

```bash
# Убедитесь, что проект собирается без ошибок
npm run build

# Проверьте наличие файла build/index.html
ls -la build/
```

### 2. Загрузка в SmartApp Studio

**Способ 1: Через веб-интерфейс**

1. Откройте SmartApp Studio: https://smartapp.sberdevices.ru
2. Нажмите "Создать новый проект"
3. Выберите тип: **Canvas App**
4. Загрузите файлы из папки `build/`:
   - `index.html`
   - Папку `static/` целиком

**Способ 2: Через CLI (если доступно)**

```bash
smartapp-studio upload build/
```

### 3. Настройка интентов

1. В SmartApp Studio перейдите в раздел **NLU/Интенты**
2. Импортируйте файл `smartapp.json`:
   ```
   Действия → Импортировать конфигурацию → smartapp.json
   ```
3. Или добавьте интенты вручную (см. TRAINING_PHRASES.json)

### 4. Тестирование

**В SmartApp Studio:**
- Используйте панель отладки внизу для отправки команд
- Говорите или пишите: "запусти таймер на 30 секунд"
- Проверьте консоль браузера (F12) на ошибки

**На устройстве:**
- Убедитесь, что приложение опубликовано
- Откройте его на Salute OS устройстве
- Произнесите команду помощнику

### 5. Параметры приложения

При загрузке установите:

| Параметр | Значение |
|----------|----------|
| Frontend Type | WEB_APP |
| App ID | salute-timer-app |
| Version | 1.0.0 |
| Display Type | CANVAS |
| Min API Level | 20 |

## Окружение развертывания

### Development (локальное тестирование)

```bash
npm start
# Откроется http://localhost:3000
# SmartApp Debugger активен для тестирования интентов
```

### Production (SmartApp Studio)

```bash
# Сборка
npm run build

# В SmartApp Studio выбрать "Production" режим
# Загрузить файлы из build/
```

## Переменные окружения

Создайте файл `.env`:

```env
# Для development
REACT_APP_TOKEN=your_smartapp_studio_token
NODE_ENV=development

# Для production
REACT_APP_TOKEN=
NODE_ENV=production
```

## Проверочный список перед публикацией

- [ ] Проект собирается без ошибок (`npm run build`)
- [ ] Нет console.error или console.warn в браузере
- [ ] Таймер работает корректно при ручном запуске
- [ ] Кнопка СТОП отключена, когда таймер не активен
- [ ] Звуковой сигнал воспроизводится при завершении
- [ ] Приложение работает на фоне (не тормозит таймер)
- [ ] Голосовые команды распознаются (в SmartApp Studio)
- [ ] Дизайн корректен на разных разрешениях экрана
- [ ] Нет утечек памяти (проверьте Dev Tools)

## Разрешение доступа

Canvas App не требует специальных разрешений, так как:
- Не обращается к файловой системе
- Не использует GPS/локацию
- Не требует доступа к камере/микрофону
- Не собирает личные данные

Все данные передаются только через Salute SDK.

## Горячая линия

Если возникнут ошибки:

1. **Проверьте логи:**
   ```bash
   # В SmartApp Studio → Developer Tools → Console
   # Ищите красные сообщения об ошибках
   ```

2. **Типичные проблемы:**
   - ❌ "applicationId not found" → добавьте `appInfo` в код
   - ❌ "Ассистент не готов" → убедитесь, что инициализация завершена
   - ❌ "Звук не работает" → браузер может заблокировать audio (разрешите)
   - ❌ "Интент не распознан" → перепроверьте TRAINING_PHRASES.json

3. **Документация:**
   - SmartApp Studio Guide: https://smartapp.sberdevices.ru/docs
   - Salute SDK Docs: https://www.npmjs.com/package/@salutejs/client

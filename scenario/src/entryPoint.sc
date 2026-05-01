require: js/actions.js
    module = custom

theme: /

state: Start
    q!: $regex</start>
    script:
        // Инициализация сессии при старте
        $session.timer_active = false;
        $session.timer_duration = 0;
    a: Привет! Я голосовой таймер. Скажите, на сколько секунд или минут запустить отсчёт.

state: /set_timer
    intent!: /set_timer
    script:
        // Парсим время из распознанного текста
        var text = $request.query || "";
        var duration = $jsapi.parseTimerDuration(text);
        
        // Сохраняем в сессию
        $session.timer_duration = duration;
        $session.timer_active = true;
        $temp.duration = duration;
        
        // Отправляем команду на Canvas App
        $reactions.appendCommand({
            type: "smart_app_data",
            smart_app_data: {
                type: "set_timer",
                duration: duration
            }
        });
    a: Таймер запущен на {{$temp.duration}} секунд.

state: /cancel_timer
    intent!: /cancel_timer
    script:
        // Останавливаем таймер
        $session.timer_active = false;
        $session.timer_duration = 0;
        
        // Отправляем команду на Canvas App
        $reactions.appendCommand({
            type: "smart_app_data",
            smart_app_data: {
                type: "cancel_timer"
            }
        });
    a: Таймер остановлен.

state: /timer_finished
    event!: timer_finished
    script:
        $session.timer_active = false;
    a: Время вышло! Таймер завершён.

state: /no_match
    event!: noMatch
    a: Я умею только запускать и останавливать таймер. Скажите, например, «Таймер на 30 секунд» или «Останови таймер».

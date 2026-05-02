require: js/actions.js

patterns:
    $TimerStart = ((* запусти * таймер *) | (* поставь * таймер *) | (* включи * таймер *) | (* установи * таймер *) | (* таймер * на *) | (* таймер на *) | (* на * сек *) | (* на * минут *) | (* засеки *) | (* отсчёт * на *) | (* отсчет * на *))
    $TimerStop = ((* останови * таймер *) | (* отмени * таймер *) | (* выключи * таймер *) | (* убери * таймер *) | (* прекрати * отсчёт *) | (* прекрати * отсчет *) | стоп | отмена | хватит)

theme: /
    state: Start
        q!: $regex</start>
        script:
            $session.timer_active = false;
            $session.timer_duration = 0;
        a: Привет! Я голосовой таймер. Скажите, на сколько секунд или минут запустить отсчёт.

    state: /set_timer
        intent!: /set_timer
        q!: $TimerStart
        script:
            var text = $request.query || "";
            var duration = Math.max(1, parseTimerDuration(text));
            $session.timer_duration = duration;
            $session.timer_active = true;
            $temp.duration = duration;
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "smart_app_data",
                smart_app_data: {
                    type: "set_timer",
                    duration: duration
                }
            });
        a: Таймер запущен на {{$temp.duration}} секунд.

    state: /cancel_timer
        intent!: /cancel_timer
        q!: $TimerStop
        script:
            $session.timer_active = false;
            $session.timer_duration = 0;
            $response.replies = $response.replies || [];
            $response.replies.push({
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

require: js/actions.js
    module = custom

theme: /

    state: Start
        q!: $regex</start>
        a: Привет! Я голосовой таймер. Скажите, на сколько секунд или минут запустить отсчёт.

    state: SetTimer
        intent!: /set_timer
        script:
            var text = $request.query || "";
            var duration = $jsapi.parseTimerDuration(text);
            $temp.duration = duration;
            $reactions.appendCommand({type: "smart_app_data", smart_app_data: {type: "set_timer", duration: duration}});
        a: Запускаю таймер на {{$temp.duration}} секунд.

    state: CancelTimer
        intent!: /cancel_timer
        script:
            $reactions.appendCommand({type: "smart_app_data", smart_app_data: {type: "cancel_timer"}});
        a: Таймер остановлен.

    state: TimerDone
        event!: timer_done
        a: Время вышло! Таймер завершён.

    state: NoMatch
        event!: noMatch
        a: Я умею только запускать и останавливать таймер. Скажите, например, «Таймер на 30 секунд».

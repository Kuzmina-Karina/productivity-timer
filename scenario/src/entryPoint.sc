require: js/actions.js
    module = custom

theme: /

    state: Start
        q!: $regex</start>
        a: Привет! Я голосовой таймер. Скажите, на сколько секунд или минут запустить отсчёт.

    state: SetTimer
        intent!: /set_timer
        script:
            var duration = $jsapi.getTimerDuration($request);
            $temp.duration = duration;
            $jsapi.sendSetTimer($response, duration);
        a: Запускаю таймер на {{$temp.duration}} секунд.

    state: CancelTimer
        intent!: /cancel_timer
        script:
            $jsapi.sendCancelTimer($response);
        a: Таймер остановлен.

    state: TimerDone
        event!: timer_done
        a: Время вышло! Таймер завершён.

    state: NoMatch
        event!: noMatch
        a: Я умею только запускать и останавливать таймер. Скажите «Запусти таймер на 30 секунд».

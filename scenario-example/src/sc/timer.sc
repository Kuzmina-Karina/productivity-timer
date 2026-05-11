theme: /

    state: TimerStartMode
        # Запуск режимов Помодоро и упражнений
        q!: (~запусти|~включи|~старт|~поставь) (~помодоро лайт|лайт помодоро)
        script:
            startTimerMode("pomodoro_light", $context);
        a: Запускаю Помодоро Лайт.

        q!: (~запусти|~включи|~старт|~поставь) (~помодоро медиум|медиум помодоро)
        script:
            startTimerMode("pomodoro_medium", $context);
        a: Запускаю Помодоро Медиум.

        q!: (~запусти|~включи|~старт|~поставь) (~помодоро хард|хард помодоро)
        script:
            startTimerMode("pomodoro_hard", $context);
        a: Запускаю Помодоро Хард.

        q!: (~запусти|~включи|~старт|~поставь) (~зарядка|~зарядку)
        script:
            startTimerMode("exercise", $context);
        a: Время для зарядки.

        q!: (~запусти|~включи|~старт|~поставь|~таймер) [на] * (~зал|для зала|в зал) *
        script:
            startTimerMode("gym", $context);
        a: Таймер для зала запущен.

    state: TimerCustom
        # Кастомный таймер: "Таймер на 5 минут", "Поставь на 10 секунд"
        # Паттерн перехватывает любую фразу после "на" и отправляет во фронт
        q!: (~таймер|~секундомер) на $AnyText::phrase
        q!: (~запусти|~включи|~старт|~поставь) [~таймер|~секундомер] на $AnyText::phrase
        script:
            startCustomTimer($parseTree._phrase, $context);
        a: Ставлю таймер на $parseTree._phrase.

    state: TimerControl
        # Стоп
        q!: (~стоп|~останови|~прекрати) [~таймер|~отсчёт|~время]
        script:
            stopTimer($context);
        a: Таймер остановлен.

        # Пауза
        q!: (~пауза|~поставь на паузу|~приостанови) [~таймер|~отсчёт|~время]
        script:
            pauseTimer($context);
        a: Таймер на паузе.

        # Продолжить
        q!: (~продолжить|~продолжай|~снова) [~отсчёт|~таймер|~время]
        script:
            resumeTimer($context);
        a: Продолжаю отсчёт.

    state: StartTimer
        q!: * (запусти|включи|поставь) * { (лайт|легкий|лёгкий): light } * (помодоро|таймер) *
        q!: * (запусти|включи|поставь) * { (медиум|средний): medium } * (помодоро|таймер) *
        q!: * (запусти|включи|поставь) * { (хард|сложный|тяжелый): hard } * (помодоро|таймер) *
        q!: * (запусти|включи|поставь) * зарядку *
        q!: * (запусти|включи|поставь) * зал *
        
        script:
            var mode = "pomodoro_light"; // по умолчанию
            var responseText = "Включаю лайт режим";
            
            if ($parseTree._light) { mode = "pomodoro_light"; responseText = "Включаю лайт помодоро"; }
            if ($parseTree._medium) { mode = "pomodoro_medium"; responseText = "Включаю средний режим помодоро"; }
            if ($parseTree._hard) { mode = "pomodoro_hard"; responseText = "Включаю хард режим! Удачи!"; }
            if ($parseTree.text.indexOf("зарядк") > -1) { mode = "exercise"; responseText = "Время размяться! Запускаю зарядку"; }
            if ($parseTree.text.indexOf("зал") > -1) { mode = "gym"; responseText = "Работаем! Таймер для зала запущен"; }
            
            $answers.addAnswer(responseText);
            
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: mode
                            }
                        }
                    }]
                }
            });
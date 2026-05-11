theme: /

    state: TimerStartLight
        q!: (~запусти|~включи|~старт|~поставь) (~помодоро лайт|лайт помодоро)
        q!: * помодоро лайт *
        q!: * лайт помодоро *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "start_mode", mode: "pomodoro_light" } } }] } });
        a: Запускаю Помодоро Лайт.

    state: TimerStartMedium
        q!: (~запусти|~включи|~старт|~поставь) (~помодоро медиум|медиум помодоро)
        q!: * помодоро медиум *
        q!: * медиум помодоро *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "start_mode", mode: "pomodoro_medium" } } }] } });
        a: Запускаю Помодоро Медиум.

    state: TimerStartHard
        q!: (~запусти|~включи|~старт|~поставь) (~помодоро хард|хард помодоро)
        q!: * помодоро хард *
        q!: * хард помодоро *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "start_mode", mode: "pomodoro_hard" } } }] } });
        a: Запускаю Помодоро Хард.

    state: TimerStartExercise
        q!: (~запусти|~включи|~старт|~поставь) (~зарядка|~зарядку)
        q!: * зарядк* *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "start_mode", mode: "exercise" } } }] } });
        a: Время для зарядки.

    state: TimerStartGym
        q!: (~запусти|~включи|~старт|~поставь|~таймер) [на] * (~зал|для зала|в зал) *
        q!: * зал* *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "start_mode", mode: "gym" } } }] } });
        a: Таймер для зала запущен.

    state: TimerStop
        q!: (~стоп|~останови|~прекрати) [~таймер|~отсчёт|~время]
        q!: * стоп *
        q!: * останови* *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "stop_timer" } } }] } });
        a: Таймер остановлен.

    state: TimerPause
        q!: (~пауза|~поставь на паузу|~приостанови) [~таймер|~отсчёт|~время]
        q!: * пауз* *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "pause_timer" } } }] } });
        a: Таймер на паузе.

    state: TimerResume
        q!: (~продолжить|~продолжай|~снова) [~отсчёт|~таймер|~время]
        q!: * продолж* *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({ type: "raw", body: { items: [{ command: { type: "smart_app_data", smart_app_data: { type: "resume_timer" } } }] } });
        a: Продолжаю отсчёт.
    
    state: TimerAnnouncementBreakStart
        event: announcement_break_start
        a: Ура! Время перерыва. Отдохни и выпей воды.

    state: TimerAnnouncementWorkStart
        event: announcement_work_start
        a: Время работать! Не отвлекайся.
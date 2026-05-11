theme: /

    state: TimerStartMode
        # Запуск режимов Помодоро и упражнений
        q!: (~запусти|~включи|~старт|~поставь) (~помодоро лайт|лайт помодоро)
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: "pomodoro_light"
                            }
                        }
                    }]
                }
            });
        a: Запускаю Помодоро Лайт.

        q!: (~запусти|~включи|~старт|~поставь) (~помодоро медиум|медиум помодоро)
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: "pomodoro_medium"
                            }
                        }
                    }]
                }
            });
        a: Запускаю Помодоро Медиум.

        q!: (~запусти|~включи|~старт|~поставь) (~помодоро хард|хард помодоро)
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: "pomodoro_hard"
                            }
                        }
                    }]
                }
            });
        a: Запускаю Помодоро Хард.

        q!: (~запусти|~включи|~старт|~поставь) (~зарядка|~зарядку)
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: "exercise"
                            }
                        }
                    }]
                }
            });
        a: Время для зарядки.

        q!: (~запусти|~включи|~старт|~поставь|~таймер) [на] * (~зал|для зала|в зал) *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "start_mode",
                                mode: "gym"
                            }
                        }
                    }]
                }
            });
        a: Таймер для зала запущен.

    state: TimerControl
        # Стоп
        q!: (~стоп|~останови|~прекрати) [~таймер|~отсчёт|~время]
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "stop_timer"
                            }
                        }
                    }]
                }
            });
        a: Таймер остановлен.

        # Пауза
        q!: (~пауза|~поставь на паузу|~приостанови) [~таймер|~отсчёт|~время]
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "pause_timer"
                            }
                        }
                    }]
                }
            });
        a: Таймер на паузе.

        # Продолжить
        q!: (~продолжить|~продолжай|~снова) [~отсчёт|~таймер|~время]
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            smart_app_data: {
                                type: "resume_timer"
                            }
                        }
                    }]
                }
            });
        a: Продолжаю отсчёт.

    # ✅ НОВЫЕ СТЕЙТЫ: Обработка объявлений о фазах из React
    # Они играют одновременно с сигналом рингтона, который затихает через 3 сек.

    state: TimerAnnouncementBreakStart
        # Перехватываем сигнал 'announcement_break_start'
        event: announcement_break_start
        a: Ура! Время перерыва. Отдохни и выпей воды.

    state: TimerAnnouncementWorkStart
        # Перехватываем сигнал 'announcement_work_start'
        event: announcement_work_start
        a: Время работать! Не отвлекайся.
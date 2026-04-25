theme: /

    state: ЗаданиеВыполнено
        event!: done
        event!: DONE

        script:
            ### Пример обработки сообщения, отправленного из фронтенда с помощью sendData()
            log('noteDone: context: ' + JSON.stringify($context))
            var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData || {}
            log('noteDone: eventData: ' + JSON.stringify($context && $context.request && $context.request.data && $context.request.data.eventData))
            $reactions.answer({
                "value": "Ты - " + eventData.value,
            });
            ###
            addSuggestions(["Добавь 'купить машину'"], $context);
        # random:
            # a: Молодец!
            # a: Красавичк!
            # a: Супер!

    state: ТаймерЗавершён
        event!: timer_done
        event!: TIMER_DONE

        script:
            log('timerDone: context: ' + JSON.stringify($context))
            var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData || {}
            log('timerDone: eventData: ' + JSON.stringify(eventData))

        random:
            a: Время вышло!
            a: Таймер сработал!
            a: Готово, время истекло!
        
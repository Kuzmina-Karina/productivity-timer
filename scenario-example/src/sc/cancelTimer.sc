theme: /

    state: ОтменаТаймера
        q!: (~остановить|~отменить|~выключить|~останови|~отмени|~выключи|~убери|~сбрось) таймер

        script:
            log('cancelTimer: context: ' + JSON.stringify($context))
            cancelTimer($context);

        random:
            a: Таймер отменён.
            a: Остановила таймер.
            a: Готово, таймер сброшен.

    state: СтопТаймер
        q!: (стоп|хватит|достаточно) таймер

        script:
            log('cancelTimer stop: context: ' + JSON.stringify($context))
            cancelTimer($context);

        a: Таймер остановлен.

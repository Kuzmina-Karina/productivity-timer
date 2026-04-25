theme: /

    state: УстановкаТаймера
        q!: (~поставить|~запустить|~установить|~включить|~завести) таймер [на] $AnyText::anyText

        script:
            log('setTimer: context: ' + JSON.stringify($context))
            log('setTimer: parseTree: ' + JSON.stringify($parseTree))
            var text = $parseTree._anyText || '';
            var seconds = parseTimerDuration(text);
            log('setTimer: text: ' + text + ' seconds: ' + seconds)
            setTimer(seconds, $context);

        random:
            a: Таймер запущен!
            a: Готово, засекаю!
            a: Запустила таймер!

    state: ТаймерБыстрый
        q!: таймер [на] $AnyText::anyText

        script:
            log('setTimer quick: parseTree: ' + JSON.stringify($parseTree))
            var text = $parseTree._anyText || '';
            var seconds = parseTimerDuration(text);
            log('setTimer quick: text: ' + text + ' seconds: ' + seconds)
            setTimer(seconds, $context);

        random:
            a: Таймер запущен!
            a: Засекаю!

function startTimerMode(mode, context) {
    addAction({
        type: "start_mode",
        mode: mode
    }, context);
}

function startCustomTimer(phrase, context) {
    // Фронтенд сам распарсит фразу, например "на 5 минут"
    addAction({
        type: "start_custom_timer",
        phrase: phrase
    }, context);
}

function stopTimer(context) {
    addAction({
        type: "stop_timer"
    }, context);
}

function pauseTimer(context) {
    addAction({
        type: "pause_timer"
    }, context);
}

function resumeTimer(context) {
    addAction({
        type: "resume_timer"
    }, context);
}
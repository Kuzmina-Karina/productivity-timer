function addNote(note, context) {
    addAction({
        type: "add_note",
        note: note
    }, context);
}

function doneNote(id, context){
    addAction({
        type: "done_note",
        id: id
    }, context);
}

function deleteNote(id, context){
    addAction({
        type: "delete_note",
        id: id
    }, context);
}

function setTimer(durationSeconds, context){
    addAction({
        type: "set_timer",
        duration: durationSeconds
    }, context);
}

function cancelTimer(context){
    addAction({
        type: "cancel_timer"
    }, context);
}

function parseTimerDuration(text) {
    if (!text) return 60;
    text = text.toLowerCase().trim();

    // Извлекаем число из текста
    var match = text.match(/\d+/);
    var num = match ? parseInt(match[0], 10) : 1;
    if (num <= 0) num = 1;

    // Определяем единицу времени
    if (text.indexOf('сек') !== -1) {
        return num;
    }
    if (text.indexOf('час') !== -1) {
        return num * 3600;
    }
    // По умолчанию — минуты
    return num * 60;
}
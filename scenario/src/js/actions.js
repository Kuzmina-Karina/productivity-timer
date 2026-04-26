/**
 * Серверные функции сценария голосового таймера.
 *
 * getTimerDuration — парсит длительность из голосовой фразы
 * sendSetTimer     — отправляет команду set_timer на Canvas App
 * sendCancelTimer  — отправляет команду cancel_timer на Canvas App
 */

var wordToNumber = {
    "одну": 1, "одна": 1, "один": 1, "одно": 1,
    "две": 2, "два": 2, "двух": 2,
    "три": 3, "трёх": 3, "трех": 3,
    "четыре": 4, "четырёх": 4, "четырех": 4,
    "пять": 5, "пяти": 5,
    "шесть": 6, "шести": 6,
    "семь": 7, "семи": 7,
    "восемь": 8, "восьми": 8,
    "девять": 9, "девяти": 9,
    "десять": 10, "десяти": 10,
    "одиннадцать": 11, "двенадцать": 12, "тринадцать": 13,
    "четырнадцать": 14, "пятнадцать": 15, "пятнадцати": 15,
    "двадцать": 20, "двадцати": 20,
    "тридцать": 30, "тридцати": 30,
    "сорок": 40, "сорока": 40,
    "пятьдесят": 50, "шестьдесят": 60,
    "полчаса": 1800,
    "час": 3600
};

function getTimerDuration(req) {
    var text = "";

    /* Извлекаем текст из запроса — пробуем разные поля */
    if (req && req.query) {
        text = req.query;
    } else if (req && req._input) {
        text = req._input;
    } else if (req && req.text) {
        text = req.text;
    } else if (typeof req === "string") {
        text = req;
    }

    text = text.toLowerCase();

    /* Специальные случаи */
    if (text.indexOf("полчаса") !== -1) return 1800;
    if (text.indexOf("полтора часа") !== -1) return 5400;
    if (/\bчас\b/.test(text) && text.indexOf("полтора") === -1) return 3600;

    /* Ищем цифру */
    var numMatch = text.match(/(\d+)/);
    var value = numMatch ? parseInt(numMatch[1], 10) : 0;

    /* Если цифры нет — ищем числительное прописью */
    if (!value) {
        var words = text.split(/\s+/);
        for (var i = 0; i < words.length; i++) {
            if (wordToNumber[words[i]]) {
                value = wordToNumber[words[i]];
                break;
            }
        }
    }

    var isMinutes = /минут/.test(text);
    if (!value) value = 60;

    return isMinutes ? value * 60 : value;
}

/**
 * Отправляет команду set_timer на фронтенд Canvas App.
 * Используем $response.appendCommand — надёжный способ доставки.
 */
function sendSetTimer(resp, durationSec) {
    resp.appendCommand({
        type: "smart_app_data",
        smart_app_data: {
            type: "set_timer",
            duration: durationSec
        }
    });
}

/**
 * Отправляет команду cancel_timer на фронтенд Canvas App.
 */
function sendCancelTimer(resp) {
    resp.appendCommand({
        type: "smart_app_data",
        smart_app_data: {
            type: "cancel_timer"
        }
    });
}

addAction("getTimerDuration", getTimerDuration);
addAction("sendSetTimer", sendSetTimer);
addAction("sendCancelTimer", sendCancelTimer);

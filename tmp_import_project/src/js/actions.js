/**
 * Парсинг длительности из естественной фразы пользователя.
 * Поддерживает цифры и базовые числительные прописью.
 */

var units = {
    "ноль": 0,
    "один": 1, "одна": 1, "одну": 1, "одно": 1,
    "два": 2, "две": 2,
    "три": 3,
    "четыре": 4,
    "пять": 5,
    "шесть": 6,
    "семь": 7,
    "восемь": 8,
    "девять": 9
};

var teens = {
    "десять": 10,
    "одиннадцать": 11,
    "двенадцать": 12,
    "тринадцать": 13,
    "четырнадцать": 14,
    "пятнадцать": 15,
    "шестнадцать": 16,
    "семнадцать": 17,
    "восемнадцать": 18,
    "девятнадцать": 19
};

var tens = {
    "двадцать": 20,
    "тридцать": 30,
    "сорок": 40,
    "пятьдесят": 50,
    "шестьдесят": 60
};

function isMinuteWord(word) {
    return /^мин(ута|уты|ут|)\b/.test(word) || /^мин\b/.test(word);
}

function isSecondWord(word) {
    return /^сек(унда|унды|унд|)\b/.test(word) || /^сек\b/.test(word);
}

function wordsToNumber(tokens) {
    if (!tokens || !tokens.length) {
        return null;
    }

    var total = 0;
    for (var i = 0; i < tokens.length; i += 1) {
        var token = tokens[i];
        if (tens[token]) {
            total += tens[token];
            continue;
        }
        if (teens[token]) {
            total += teens[token];
            continue;
        }
        if (units[token] !== undefined) {
            total += units[token];
            continue;
        }
    }

    return total > 0 ? total : null;
}

function normalize(text) {
    return (text || "")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[.,!?;:()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractNearUnit(words, index) {
    var token = words[index];
    if (/^\d+$/.test(token)) {
        return parseInt(token, 10);
    }

    var phraseTokens = [token];
    if (words[index + 1] && !isMinuteWord(words[index + 1]) && !isSecondWord(words[index + 1])) {
        phraseTokens.push(words[index + 1]);
    }

    return wordsToNumber(phraseTokens);
}

function parseTimerDuration(text) {
    var t = normalize(text);
    if (!t) return 60;

    if (t.indexOf("полчаса") !== -1) return 1800;
    if (t.indexOf("полторы минуты") !== -1 || t.indexOf("полтора минуты") !== -1) return 90;

    var words = t.split(" ");
    var minutes = 0;
    var seconds = 0;

    for (var i = 0; i < words.length; i += 1) {
        if (isMinuteWord(words[i])) {
            var minuteValue = extractNearUnit(words, i - 1);
            if (minuteValue !== null && minuteValue !== undefined) {
                minutes = minuteValue;
            }
        }
        if (isSecondWord(words[i])) {
            var secondValue = extractNearUnit(words, i - 1);
            if (secondValue !== null && secondValue !== undefined) {
                seconds = secondValue;
            }
        }
    }

    if (minutes > 0 || seconds > 0) {
        return minutes * 60 + seconds;
    }

    var numeric = t.match(/\d+/);
    if (numeric) {
        return Math.max(1, parseInt(numeric[0], 10));
    }

    var wordValue = wordsToNumber(words);
    if (wordValue) {
        return t.indexOf("мин") !== -1 ? wordValue * 60 : wordValue;
    }

    return 60;
}

addAction("parseTimerDuration", parseTimerDuration);

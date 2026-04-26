/**
 * Парсинг длительности из голосовой фразы.
 * Поддерживает цифры, числительные прописью, «минуту 30 секунд», «полчаса».
 */

var wordToNum = {
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
    "пятьдесят": 50, "шестьдесят": 60
};

function parseTimerDuration(text) {
    if (!text) return 60;
    var t = text.toLowerCase();

    if (t.indexOf("полчаса") !== -1) return 1800;
    if (t.indexOf("полтора часа") !== -1) return 5400;
    if (t.indexOf("час") !== -1 && t.indexOf("полтора") === -1) return 3600;

    var total = 0;

    /* Комбинация: N минут M секунд */
    var combo = t.match(/(\d+)\s*минут\S*\s*(?:и\s*)?(\d+)\s*секунд/);
    if (combo) return parseInt(combo[1]) * 60 + parseInt(combo[2]);

    /* Отдельно минуты */
    var minM = t.match(/(\d+)\s*минут/);
    if (minM) total += parseInt(minM[1]) * 60;

    /* Отдельно секунды */
    var secM = t.match(/(\d+)\s*секунд/);
    if (secM) total += parseInt(secM[1]);

    if (total > 0) return total;

    /* Просто число */
    var num = t.match(/(\d+)/);
    if (num) return parseInt(num[1]);

    /* Прописью */
    var words = t.split(/\s+/);
    for (var i = 0; i < words.length; i++) {
        if (wordToNum[words[i]]) {
            var val = wordToNum[words[i]];
            return t.indexOf("минут") !== -1 ? val * 60 : val;
        }
    }

    return 60;
}

addAction("parseTimerDuration", parseTimerDuration);

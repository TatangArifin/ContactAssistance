function getGreetingWord() {
    var date = new Date();
    var hour = date.getHours();
    var word = "";
    if (hour < 12) {
        word = "word_goodmorning";
    } else if (hour >= 12 && hour <= 17) {
        word = "word_goodafternoon";
    } else if (hour > 15 && hour <= 18) {
        word = "word_goodevening";
    } else {
        word = "word_goodnight";
    }
    return word;
}

function capitalizeWords(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

exports.getGreetingWord = getGreetingWord;
exports.capitalizeWords = capitalizeWords;
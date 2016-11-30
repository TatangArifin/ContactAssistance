var builder = require('botbuilder');
var localeList = ["Bahasa", "English"];
var localeValue = ["id", "en"];

module.exports = {
    Id: "localepicker",
    Label: "LocalePicker",
    Dialog: [
        function (session) {
            builder.Prompts.choice(session, "locale_prompt", localeList, {
                retryPrompt: "locale_undefined"
            });
        },
        function (session, results, next) {
            console.log(results);
            var locale = "";
            var index = -1;
            for (i = 0; i < localeList.length; i++) {
                if (localeList[i] === results.response.entity) {
                    index = i;
                }
            }
            if (index <= -1) {
                session.send("locale_undefined");
                next();
                return;
            }
            locale = localeValue[index];
            session.preferredLocale(locale, function (err) {
                if (!err) {
                    session.userData.locale = locale;
                    session.send('locale_changed');
                    session.endDialogWithResult();
                } else {
                    session.error(err);
                }
            });
        }
    ]
};
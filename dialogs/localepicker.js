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
                //if (results.response.entity === "#*PEER$#") {
                //session.endDialogWithResult();
                //return;
                //}
                session.send("locale_undefined_selected");
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
                session.send("locale_undefined_selected");
                next();
                return;
            }
            locale = localeValue[index];
            session.preferredLocale(locale, function (err) {
                if (!err) {
                    session.userData.locale = locale;
                    session.send('locale_changed');
                    session.beginDialog(this.NextDialog);
                } else {
                    session.error(err);
                }
            });
        }
    ],
    changeLocale: function (session, results) {
        console.log("1");
        var index = 0;
        if (results.toLowerCase() === "inggris" || results.toLowerCase() === "english") {
            index = 1
        } else {
            index = 0;
        }
        var locale = localeValue[index];
        console.log(locale);
        var dlg = this.NextDialog;
        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.userData.locale = locale;
                session.send('locale_changed');
                session.beginDialog(dlg);
            } else {
                session.error(err);
            }
        });
    }
};
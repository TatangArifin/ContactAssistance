// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var utils = require('./lib/utils');

var defaultLocale = "id";

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var botAppId = process.env.BOT_APP_ID;
var botAppKey = process.env.BOT_APP_SECRET;
var luisModel = process.env.LUIS_MODEL_URL || "https://api.projectoxford.ai/luis/v2.0/apps/7039cf8e-0eff-47ed-b3b7-a3356d3003ac?subscription-key=51927ef9f4134e3698c421e9862b288a&verbose=true";

// Create chat bot
var connector = new builder.ChatConnector({
    appId: botAppId,
    appPassword: botAppKey
});
var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        botLocalePath: "./locale",
        defaultLocale: defaultLocale
    }
});
server.post('/api/messages', connector.listen());

server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        session.userData.name = null;
        session.userData.locale = null;

        var word = utils.getGreetingWord();
        if (session.userData.name) {
            session.send("greeting_user", session.userData.name, session.localizer.gettext(session.preferredLocale(), word));
        } else {
            session.send("greeting_guest", session.localizer.gettext(session.preferredLocale(), word));
        }

        if (!session.userData.locale) {
            session.beginDialog('/localePicker');
        } else if (!session.userData.name) {
            session.beginDialog('/askname');
        } else {
            session.beginDialog('/askanything');
        }
    },
    function (session) {
        if (!session.userData.name) {
            session.beginDialog('/askname');
        } else {
            session.beginDialog('/askanything');
        }
    },
    function (session, results) {
        session.send("welcome_userentered", session.userData.name);
        session.beginDialog('/askanything');
    }
]);

bot.dialog('/askname', [
    function (session) {
        builder.Prompts.text(session, "ask_name");
    },
    function (session, results) {
        session.userData.name = utils.capitalizeWords(results.response);
        session.endDialog();
    }
]);

bot.dialog('/askanything', [
    function (session) {
        session.send("ask_anything");
        session.beginDialog('/recognizeintent');
    }
]);

var recognizer = new builder.LuisRecognizer(luisModel);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/recognizeintent', dialog);

dialog.matches('FindClaim', [
    function (session, args, next) {
        console.log(args);
        session.send("Intent is FindClaim");
    }
]);

dialog.matches('AskPolicy', [
    function (session, args, next) {
        console.log(args);
        session.send("Intent is AskPolicy");
    }
]);

dialog.matches('FindProduct', [
    function (session, args, next) {
        console.log(args);
        if (args.entities.length <= 0 && args.entities) {
            session.send("intent_undefined");
            session.beginDialog('/askanything');
            return;
        }
        var intent = args.entities[0].intent;
        var intentType = args.entities[0].type; 
        session.send("Intent is FindProduct");
    }
]);

dialog.onDefault([
    function (session) {
        session.send("intent_undefined");
        session.beginDialog('/askanything');
    }
]);

bot.dialog('/localePicker', [
    function (session) {
        session.send("instructions_locale");
        builder.Prompts.choice(session, "locale_prompt", ["Bahasa", "English"], {
            retryPrompt: "locale_undefined"
        });
    },
    function (session, results) {
        var locale = "";
        switch (results.response.entity) {
            case 'Bahasa':
                locale = 'id';
                break;
            case 'English':
                locale = 'en';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.userData.locale = locale;
                session.endDialog('locale_changed');
            } else {
                session.error(err);
            }
        });
    }
]);
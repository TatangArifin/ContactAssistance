// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');
var utils = require('./lib/utils');

// App Vars
var defaultLocale = "id";
var switchToPeerText = "#*PEER$#";

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var botAppId = process.env.BOT_APP_ID;
var botAppKey = process.env.BOT_APP_SECRET;
var luisModel = process.env.LUIS_MODEL_URL

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

// Require Dialogs
var LocalePicker = require('./dialogs/localepicker');
var AskName = require('./dialogs/askname');

// Register Dialogs
bot.dialog('/localepicker', LocalePicker.Dialog);
bot.dialog('/askname', AskName.Dialog);

bot.dialog('/', [
    function (session) {
        // For Test
        session.userData.greeting = null;
        session.userData.name = null;
        session.userData.locale = null;
        session.userData.intent = null;

        // Greetings
        if (!session.userData.greeting) {
            var word = utils.getGreetingWord();
            if (session.userData.name) {
                session.send("greeting_user", session.userData.name, session.localizer.gettext(session.preferredLocale(), word));
            } else {
                session.send("greeting_guest", session.localizer.gettext(session.preferredLocale(), word));
            }
            session.userData.greeting = true;
        }
        nextAction(session);
    },
    function (session, result) {
        nextAction(session, result);
    },
    function (session, result) {
        nextAction(session, result);
    }
]);

function nextAction(session, result) {
    // Waterfall result of any (localepicker, askname)
    if (!session.userData.locale) {
        session.send("instructions_locale");
        session.beginDialog('/localepicker');
    } else if (!session.userData.name) {
        session.beginDialog('/askname');
    } else {
        session.beginDialog('/askanything');
    }
}

bot.dialog('/askanything', [
    function (session) {
        session.send("greeting_askanything");
        session.beginDialog('/recognizeintent');
    }
]);

var recognizer = new builder.LuisRecognizer(luisModel);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/recognizeintent', dialog);

dialog.matches('AskName', [
    function (session, args, next) {
        session.send("greeting_botname", process.env.BOT_NAME, process.env.BOT_TITLE);
        session.beginDialog('/recognizeintent');
    }
]);

dialog.matches('GeneralSupport', [
    function (session, args, next) {
        switchToPeer(session, args, next);
    }
]);

dialog.matches('FindClaim', [
    function (session, args, next) {
        switchToPeer(session, args, next);
    }
]);

dialog.matches('AskPolicy', [
    function (session, args, next) {
        switchToPeer(session, args, next);
    }
]);

dialog.matches('FindProduct', [
    function (session, args, next) {
        switchToPeer(session, args, next);
    }
]);

dialog.onDefault([
    function (session) {
        session.send("intent_undefined");
        session.beginDialog('/askanything');
    }
]);

function switchToPeer(session, args, next) {
    // args : {"score":0.9544211,"intent":"FindClaim","intents":[{"intent":"FindClaim","score":0.9544211},{"intent":"AskPolicy","score":0.0218729619},{"intent":"None","score":0.0132386526},{"intent":"FindProduct","score":0.0116524026}],"entities":[]}
    session.userData.intent = args;
    session.send(switchToPeerText);
    session.send("message_switchtopeer", session.userData.name);
}
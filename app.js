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

// App Vars
var agentList = [];

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        var address = JSON.stringify(session.message.address);
        console.log(address);
        session.send("Welcome to Contact Assistance Bot!");
        session.send("Your address is " + address);
        session.send("If you want become an CS Agent, please type CS_ON and to stop type CS_OFF. All the messages from users will be forwarded to you.");
        session.beginDialog('/user');
    }
]);

bot.dialog('/user', [
    function (session) {
        builder.Prompts.text(session, "Type anything and I will send back to you.");
    },
    function (session, results) {
        if (results.response.toUpperCase() === "CS_ON") {
            agentList.push(session.message.address);
            session.replaceDialog('/cs');
        } else if (results.response.toUpperCase() === "CLR") {
            agentList = [];
        } else if (results.response.toUpperCase() === "LST") {
            session.send("[LIST] : " + JSON.stringify(agentList));
        } else if (agentList.length >= 1) {
            var msg = new builder.Message()
                .address(agentList[0])
                .text(JSON.stringify(session.message.address) + "===" + results.response);
            bot.send(msg, function (err) {
                console.log("ERR FWD : " + err);
            });
        } else {
            session.send("[USER] type : " + results.response);
            session.replaceDialog('/user');
        }
    }
]);

bot.dialog('/cs', [
    function (session) {
        builder.Prompts.text(session, "Type anything and I will forward it.");
    },
    function (session, results) {
        if (results.response.toUpperCase() === "CS_OFF") {
            agentList = [];
            session.replaceDialog('/user');
        } else if (results.response.toUpperCase() === "CLR") {
            agentList = [];
        } else if (results.response.toUpperCase() === "LST") {
            session.send("[LIST] : " + JSON.stringify(agentList));
        } else if (results.response.indexOf("===") >= 1) {
            var destAddr = results.response.substring(0, results.response.indexOf("==="));
            var destText = results.response.substring(results.response.indexOf("===") + 3, results.response.length);
            var msg = new builder.Message()
                .address(JSON.parse(destAddr))
                .text(destText);
            bot.send(msg, function (err) {
                console.log("ERR REPLY : " + err);
            });            
        } else {
            session.send("[CS] type : " + results.response);
            session.replaceDialog('/cs');
        }
    }
]);

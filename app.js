// Add your requirements
var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var botAppId = "69881a10-bdde-4f0d-acdc-6ae138a2a450";
var botAppKey = "wCNhtjvMe04CUBznY67tTfA";

// Create chat bot
var connector = new builder.ChatConnector({
    appId: botAppId,
    appPassword: botAppKey
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello World");
});

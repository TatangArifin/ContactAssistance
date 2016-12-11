var builder = require('botbuilder');
var utils = require('../lib/utils');

module.exports = {
    Id: "askname",
    Label: "AskName",
    NextDialog: "",
    Dialog: [
        function (session) {
            builder.Prompts.text(session, "instructions_askname");
        },
        function (session, results) {
            session.userData.name = utils.capitalizeWords(results.response);
            session.send("greeting_userentered", session.userData.name);
            session.endDialogWithResult();
        }
    ]
};
var restify = require('restify');
var builder = require('botbuilder');
var config = require('./config');

//Web version
// var server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function () {
//     console.log('%s listening to %s', server.name, server.url);
// });
//
// var connector = new builder.ChatConnector({
//     appId: config.get('MicrosoftAppId'),
//     appPassword: config.get('MicrosoftAppPass')
// });
//
// server.post('/api/messages', connector.listen());

//Console version
var connector = new builder.ConsoleConnector().listen();

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, function (session) {
    if (!session.privateConversationData.hello) {
        msg = new builder.Message(session)
            .speak("Hello I am demo bot")
            .text("Hello I am demo bot");
        session.send(msg);
        session.privateConversationData.hello = true
    }
    session.send('What can I do for you?');
    session.beginDialog('selection');
})
    .set('storage', inMemoryStorage);

bot.dialog('selection', [
    (session) => {
        builder.Prompts.choice(session, "Available options", "basic|carousel|receipt");
    },
    (session, result) => {
        switch (result.response.index) {
            case 0:
                session.beginDialog('basic');
                break;
            case 1:
                session.beginDialog('carousel');
                break;
            case 2:
                session.beginDialog('receipt');
                break;
            case 3:
                session.beginDialog('signin');
                break;
        }
    }
]);

bot.dialog('basic', [
    (session) => {
        builder.Prompts.text(session, "Enter your text here");
    },
    (session, results) => {
        session.send(`You said ${results.response}`);
        session.endDialog()
    }
]);

bot.dialog('carousel', [
    (session) => {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel);
        msg.attachments([
            new builder.HeroCard(session)
                .title("Item 1")
                .subtitle("subtitle")
                .text("text")
                .images([builder.CardImage.create(session, 'https://dummyimage.com/600x400/000/fff&text=sample+text')])
                .buttons([
                    builder.CardAction.imBack(session, "Item 1 selected", "Select")
                ]),
            new builder.HeroCard(session)
                .title("Item 2")
                .subtitle("subtitle")
                .text("text")
                .images([builder.CardImage.create(session, 'https://dummyimage.com/600x400/000/fff&text=sample+text')])
                .buttons([
                    builder.CardAction.imBack(session, "Item 2 selected", "Select")
                ])
        ]);
        session.send(msg).endDialog()
    }
]);

bot.dialog('receipt', [
    (session) => {
        var msg = new builder.Message(session);
        receipt = new builder.ReceiptCard(session)
            .title('My receipt')
            .facts([
                builder.Fact.create(session, 12345, 'Fact 1'),
                builder.Fact.create(session, 'TEST', 'Fact 2')
            ])
            .items([
                builder.ReceiptItem.create(session, '$ 5', 'Item 1')
                    .quantity("4")
                    .image(builder.CardImage.create(session, 'https://dummyimage.com/600x400/000/fff&text=sample+text')),
                builder.ReceiptItem.create(session, '$ 10', 'Item 2')
                    .quantity("6")
            ])
            .tax('$ 2')
            .total('$ 90');
        msg.addAttachment(receipt);
        session.send(msg).endDialog();
    }
]);

bot.dialog('signin', [
    (session) => {
        var msg = new builder.Message(session);
        receipt = new builder.SigninCard(session)
            .text('Sage Club Sign in')
            .button('Sign-in', 'https://login.microsoftonline.com');
        msg.addAttachment(receipt);
        session.send(msg);
    },
    (session, results) => {
        session.send("results");
        session.endDialog()
    }
]);

bot.dialog('help', [
    (session) => {
        session.send("Sorry I can't help you.");
        session.endDialog();
    }
]).triggerAction({
    matches: /help/i,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});
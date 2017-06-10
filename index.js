var alexa = require('alexa-app');
var winston = require('winston');
var glob = require('glob');
var akinator = require('./akinator.js');
var pjson = require('./package.json');


if (!process.env.ISLAMBDA) {
  var express = require('express');
  var bodyParser = require('body-parser');
}

class AlexaApp {
  constructor(options) {
    this.name = options.name;
    this.port = options.port || process.env.PORT || 5000;
    this.initializeApp();
    this.initializeServer();
    this.loadIntents();
  }

  initializeServer() {
    this.server = express();
    this.server.set('view engine', 'ejs');
    this.server.listen(this.port);
    winston.log('info','Listening on port '+this.port);
    winston.log('info','You can access your intent information at http://localhost:'+this.port+'/echo/'+this.name);
    var router = express.Router();
    this.app.express({ router: router, checkCert: false });
    this.server.use('/echo', router);
    // Set custom error answer
    this.app.messages.NO_INTENT_FOUND= "Ich weiß leider nicht was ich mit deiner Anfrage machen soll, tut mir leid";

  }

  initializeApp() {
    this.app = new alexa.app(this.name);
    this.app.launch(function(req, res) {
        winston.log('info','Launching app ('+ pjson.version +') instance ...');
        var session = req.getSession();
        res.shouldEndSession(false);
        res.say('Willkommen bei Alexinator, dem Spiel das deine Gedanken lesen kann');
        session.set('status','launch');
        winston.log('info','... Sucessfully launched app');
    });
  }

  loadIntents() {
    var intentPath = './intents';
    glob('**.js', {cwd: './intents'}, function (er, files) {
      for (var i = 0; i < files.length; i++) {
        var currentIntent = new (require(intentPath+'/'+files[i]))();
        this.app.intent(currentIntent.name, {
          slots: currentIntent.slots,
          utterances: currentIntent.utterances
        },currentIntent.execute.bind(currentIntent));
      }
    }.bind(this));
  }
}

var alexaApp = new AlexaApp({ name: 'alexinator' });

if (process.env.ISLAMBDA) {
  exports.handler = alexaApp.app.lambda();
}

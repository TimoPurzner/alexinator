var alexa = require('alexa-app');
var winston = require('winston');
var glob = require('glob');
var akinator = require('./akinator.js');

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
    this.server.use(bodyParser.urlencoded({extended: true}));
    this.server.use(bodyParser.json());
    this.server.set('view engine', 'ejs');
    this.server.listen(this.port);
    winston.log('info','Listening on port '+this.port);
    winston.log('info','You can access your intent information at http://localhost:'+this.port+'/echo/'+this.name);
    this.app.express(this.server, '/echo/');
  }

  initializeApp() {
    this.app = new alexa.app(this.name);
    this.app.launch(function(req, res) {
        winston.log('info','Launching app instance ...');
        var session = req.getSession();
        res.shouldEndSession(false);
        // Get an Session from akinator and save it
        akinator.createSession(function(rs){
          if(rs!=false){
            session.set('akinatorSession', rs.session);
            session.set('akinatorSignature', rs.signature);
            session.set('akinatorStep', rs.step);
            session.set('akinatorQuestion', rs.question);
            winston.log('info','... Sucessfully launched app');
            console.log(session);
          }else{
            // session.set('error', "API Failed");
            winston.log('error','... Akinator API failed ');
          }
        });

        res.say('Willkommen bei Alexinator, dem Spiel das deine Gedanken lesen kann');
    });
  }

  loadIntents() {
    var intentPath = './intents';
    glob("**.js", {cwd: './intents'}, function (er, files) {
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

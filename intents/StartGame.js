/*####################################
  Intent: Start Game
  Slots:
  Starts the game and asks for the first question
######################################*/

// modules for this intent
var winston = require('winston');
var akinator = require('../akinator.js');
var moment = require('moment');

module.exports = class Intent {
  constructor() {
    this.name = "StartGame";
    this.utterances = ["Start"],
                      ["{Starte|Beginne} ein Spiel { |Alexinator}"],
                      ["{Starte|Beginne} eine Runde { |Alexinator}"],
                      ["Starte ein Spiel"],
                      ["Starte ein Spiel Alexinator"],
                      ["Starte Alexinator"],
                      ["Beginn eine Runde"],
                      ["Beginn eine Runde Alexinator"],
                      ["Beginne ein Spiel"],
                      ["Beginne ein Spiel Alexinator"],
                      ["Starte"],
                      ["Beginne"],
                      ["Lass mich raten"],
                      ["Frag mich etwas"]
  }
  execute(req, res) {
    var now = moment();
    var time = now.format('YYYY-MM-DD HH:mm:ss Z');
    winston.log('info','Intent: StartGame ['+time+']');
    res.shouldEndSession(false);
    res.say("Dann fangen wir mal an beantworte einfach meine Fragen");
    //Get current question
    var session = req.getSession();
    var question = session.get('akinatorQuestion');
    winston.log('info','Variablen angelegt');
    // Ask question and get an answer
    // Get an Session from akinator and save it
    return akinator.createSession().then(
      function(rs){ // sucess
          winston.log('info','Create session success');
          session.set('akinatorSession', rs.session);
          session.set('akinatorSignature', rs.signature);
          session.set('akinatorStep', rs.step);
          session.set('akinatorQuestion', rs.question);
          session.set('status','question');
          winston.log('info','Create session success set session done');
          res.say(rs.question).reprompt("Wenn du nicht weiter weißt frag nach hilfe!");
          return res.send();
      },
      function(error){
        winston.log('info','Create session error');
        winston.log('error', 'Das Spiel konnte nicht gestartet werden.');
        session.set('status','error');
      }
    );
  }
}

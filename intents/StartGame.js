/*####################################
  Intent: Start Game
  Slots:
  Starts the game and asks for an question
######################################*/

// modules for this intent
var winston = require('winston');
var akinator = require('../akinator.js');

module.exports = class Intent {
  constructor() {
    this.name = "StartGame";
    this.utterances = ["Start"],
                      ["{Starte|Beginne} ein Spiel { |Alexinator}"],
                      ["{Starte|Beginne} eine Runde { |Alexinator}"]
  }
  execute(req, res) {
    winston.log('info','First round started');
    res.shouldEndSession(false);
    //Get current question
    var session = req.getSession();
    var question = session.get('akinatorQuestion');
    // Ask question and get an answer
    // Get an Session from akinator and save it
    return akinator.createSession().then(
      function(rs){ // sucess
          session.set('akinatorSession', rs.session);
          session.set('akinatorSignature', rs.signature);
          session.set('akinatorStep', rs.step);
          session.set('akinatorQuestion', rs.question);
          session.set('status','question');
          res.reprompt(rs.question);
          return res.send();
      },
      function(error){
        winston.log('error', 'Game counld start');
      }
    );
  }
}

/*####################################
  Intent: GameRound
  Slots: answer | is the answer from the last question
  Is a normal Game Round whitch takes an answer from the user and
  brings it to akinator API and respond with next question
######################################*/

var winston = require('winston');
var akinator = require('../akinator.js');

module.exports = class Intent {
  constructor() {
    this.name = 'GameRound';
    this.slots = {
      'answer': 'CustomAnswer'
    };
    this.utterances = ['{-|answer}'];
  }
  execute(req, res) {
    winston.log('info', 'Intent: GameRound');
    //Get current question
    var session = req.getSession();

    // Get variables to send to akinator
    var answer      = req.slot('answer');
    var akSession   = session.get('akinatorSession');
    var akSignature = session.get('akinatorSignature');
    var akStep      = session.get('akinatorStep');
    var status      = session.get('status');
    winston.log('info', 'Status: ' +status);
    // check if there is an winning condition
    if(status=='win'){
      if(answer.toLowerCase()=='ja'){
        // TODO Send Akinator das es stimmt
        res.say("Wieder richtig gelegen Klasse");
        return res.send();
      }
      if(answer.toLowerCase()='nein'){
        res.reprompt("Dann muss ich wohl mehr fragen stellen, "+ session.get(question));
        session.set('status','question');
        return res.send();
      }
    }else{
      // Ask question and get an answer
      return akinator.sendAnswer(answer, akSession, akSignature, akStep).then(
      function(rs){ // success

        if(rs.name){ // Akinator trys to guess
          res.reprompt("Denkst du an " + rs.name + " " + rs.des + "?");
          // Save so the user can tell if the Person is right or wrong
          session.set('status','win');
          session.set('akinatorQuestion', rs.question);
          session.set('akinatorStep', rs.step);
          return res.send();
        }else{ // new question
          var question = '';
          // Get new question
          question = rs.question;
          // Asking next question
          res.reprompt(question);
          // set new question
          session.set('akinatorQuestion', rs.question);
          session.set('akinatorStep', rs.step);
        }

        return res.send();
      },
      function(error){ // error
        res.reprompt(error.error_text + ". Für Hilfe frag nach Hilfe, dann versuche ich dir zu helfen");
        return res.send();
      });
    }
  }
};

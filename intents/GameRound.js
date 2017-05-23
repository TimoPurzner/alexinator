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

    //Get current question
    var session = req.getSession();

    // Normal variables to use it
    var question = '';

    // Get variables to send to akinator
    var answer      = req.slot('answer');
    var akSession   = session.get('akinatorSession');
    var akSignature = session.get('akinatorSignature');
    var akStep      = session.get('akinatorStep');

    // Ask question and get an answer
    return akinator.sendAnswer(answer, akSession, akSignature, akStep).then(
    function(rs){ // success
      
      if(rs.name){ // Akinator trys to guess
        res.say("Denkst du an " + rs.name + " der " + rs.des);
        return res.send();
      }else{ // new question

        // Get new question
        question = rs.question;
        // Save Step
        session.set('akinatorStep', rs.step);
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
};

/*####################################
  Intent: GameRound
  Slots: answer | is the answer from the last question
  Is a normal Game Round whitch takes an answer from the user and
  brings it to akinator API and respond with next question
######################################*/

var winston = require('winston');
var akinator = require('../akinator.js');
var moment = require('moment');

module.exports = class Intent {
  constructor() {
    this.name = 'GameRound';
    this.slots = {
      'answer': 'CustomAnswer'
    };
    this.utterances = ['{-|answer}'];
  }
  execute(req, res) {
    var now = moment();
    var time = now.format('YYYY-MM-DD HH:mm:ss Z');
    winston.log('info', 'Intent: GameRound ['+time+']');
    res.shouldEndSession(false);
    //Get current question
    var session = req.getSession();

    // Get variables to send to akinator
    var answer      = req.slot('answer');
    var akSession   = session.get('akinatorSession');
    var akSignature = session.get('akinatorSignature');
    var akStep      = session.get('akinatorStep');
    var status      = session.get('status');
    winston.log('info', 'Status: ' + status);
    // ########### Person guess ################
    if(status=='win'){
      if(answer.toLowerCase()=='ja'){
        // Send Akinator that the answer is correct
        akinator.sendWin(session.get('akinatorId'), "undefined");//session.get('akinatorDes'));
        res.say("Wieder richtig gelegen Klasse");
        // Add a card so the player cann see the person whitch alexa get
        res.card({
          type: "Standard",
          title: "Alexinator",
          text: "Ich habe die gedachte Person erraten " + session.get('akinatorName')
          /*image: {
            smallImageUrl: session.get("akinatorPicURL")
          }*/
        });
        session.set('status','finished');
        return res.send();
      }
      if(answer.toLowerCase()='nein'){
        res.say("Dann muss ich wohl mehr Fragen stellen, "+ session.get(question)).reprompt("Wenn du nicht weiter weißt frag nach hilfe!");
        session.set('status','question');
        return res.send();
      }
    }else{ // ########### Usal Questan Answer ################
      // Ask question and get an answer
      return akinator.sendAnswer(answer, akSession, akSignature, akStep).then(
      function(rs){ // success
        if(rs.name){ // Akinator trys to guess
          res.say("Denkst du an " + rs.name + " " + rs.des + "?").reprompt("Ich habe gefragt ob du an" + rs.name +" denkst.");
          // Save so the user can tell if the Person is right or wrong
          session.set('akinatorId', rs.id);    // Id of the person
          session.set('akinatorName', rs.name); // Name of the guessed Person
          //session.set('akinatorDes', rs.des);  // Description of the Person
          session.set('akinatorPicURL', rs.pic);// URL of a pic of the Person
          session.set('status','win');         // Set an Status
          session.set('akinatorQuestion', rs.question); // new questen if its not the person
          session.set('akinatorStep', rs.step); // save step number
          return res.send();
        }else{ // new question
          // Asking next question
          res.say(rs.question).reprompt("Wenn du nicht weiter weißt frag nach hilfe!");
          // set new question
          session.set('akinatorQuestion', rs.question);
          session.set('akinatorStep', rs.step);
          session.set('status','question');
          return res.send();
        }
      },
      function(error){ // error
        res.say(error.error_text + ". Für Hilfe frag nach Hilfe, dann versuche ich dir zu helfen");
        return res.send();
      });
    }
  }
};

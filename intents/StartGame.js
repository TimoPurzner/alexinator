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

    //Get current question
    var session = req.getSession();
    var question = session.get('akinatorQuestion');
    // Ask question and get an answer
    res.reprompt(question);
  }
}

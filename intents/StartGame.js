module.exports = class Intent {
  constructor() {
    this.name = "StartGame";
    this.utterances = ["Start"],
                      ["{Starte|Beginne} ein Spiel { |Alexinator}"],
                      ["{Starte|Beginne} eine Runde { |Alexinator}"]
  }
  execute(req, res) {
    //Get current question
    var session = req.getSession();
    var question = session.get('akinatorQuestion');
    // Ask question and get an answer
    console.log(session);
    res.reprompt(question);
  }
}

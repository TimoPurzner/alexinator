/*####################################
  Intent: stop
  Slots:
  If the Player dont want to use the skill anymore
######################################*/
module.exports = class TestIntent {
  constructor() {
    this.name = "AMAZON.StopIntent";
    this.utterances = ["Stop"]
  }
  execute(req, rsp) {

    rsp.shouldEndSession(true);
    //Get current question
    var session = req.getSession();
    session.set("stats", "finished")
    rsp.say("Tschüß, hoffentlich spielen wird bald wieder.");
  }
}

module.exports = class Intent {
  constructor() {
    this.name = "StartGame";
    this.slots = {
      "answer": "answer"
    };
    this.utterances = ["{answer}"];
  }
  execute(req, rsp) {
    //Get current question
    var session = req.getSession();
    var answer = request.slot("answer");

    // get session parameter
    var aSession = session.get('akinatorSession');
    var aSignature = session.get('akinatorSignature');
    var aStep = session.get('akinatorStep');
    //send answer
    akinator.sendAnswer(answer, aSession, aSignature, aStep);
  }
}

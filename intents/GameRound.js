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

    // Normal variables to use it
    var question = "";

    // Get variables to send to akinator
    var answer      = req.slot("slotName")
    var akSession   = session.get('akinatorSession');
    var akSignature = session.get('akinatorSignature');
    var akStep      = session.get('akinatorStep');


    // Ask question and get an answer
    return akinator.sendAnswer(answer, akSession, akSignature, akStep).then(
    function(rs){ // sucess
      // Get new question
      question = rs.question;
      

      // Asking next question
      res.reprompt(question);
    },
    function(error){ // error
      winston.log('error', '... Launching failed!!');
    });
}

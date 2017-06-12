/*####################################
  Intent: help
  Slots:
  Gives the player some help with whitch words he can use now
######################################*/
module.exports = class TestIntent {
  constructor() {
    this.name = "AMAZON.HelpIntent";
    this.utterances = ["Hilfe"],
                      ["Was soll ich tun?"],
                      ["Was kann ich tun?"],
                      ["Was ist das hier?"]
  }
  execute(req, rsp) {

    rsp.shouldEndSession(false);
    //Get current question
    var session = req.getSession();
    var status = session.get('status');

    switch (status) {
      case 'launch':
          rsp.say("Du hast noch kein Spiel angefangen, wenn du ein Spiel beginnen möchtest sag einfach starte eine Spiel").reprompt();
        break;
      case 'question':
          rsp.say("Die Aktuelle Frage ist:" + session.get("akinatorQuestion") + "Antworte mit Ja, Nein ,ich weiß nicht, wahrscheinlich oder wahrscheinlich nicht").reprompt();
      break;
      case 'finished':
          rsp.say("Ich habe die Letze Person erraten an die du gedacht hast. Sage Starte eine Runde um ein neues Spiel zu begeinnen").reprompt();
      break;
      case 'win':
        resp.say("Ich wollte wissen ob du an " + session.get("akinatorName") + " gedacht hast").reprompt();
        break;
      default:
        rsp.say("Alexinator ist ein Spiel das versucht eine Person zu erraten, an die du denkst! Dazu stelle ich dir "+
              "einige Fragen. Beantworte diese einfach mit Ja, Nein, ich weiß nicht, Wahrscheinlich, Wahrscheinlich nicht");
    }


  }
}

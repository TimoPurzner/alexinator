module.exports = class TestIntent {
  constructor() {
    this.name = "help";
    this.utterances = ["Hilfe"],
                      ["Was soll ich tun?"],
                      ["Was kann ich tun?"],
                      ["Was ist das hier?"]
  }
  execute(req, rsp) {
    console.log("You asked for help")
    rsp.say("Alexinator ist ein Spiel das versucht eine Person zu erraten, an die du denkst! Dazu stelle ich dir "+
            "einige Fragen. Beantworte diese einfach mit Ja, Nein, ich weiß nicht, Wahrscheinlich, Wahrscheinlich nicht");
  }
}

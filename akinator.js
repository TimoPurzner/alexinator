var winston = require('winston');
var request = require('request');

var url = 'http://api-de1.akinator.com/ws/';

/**
  Öffnet eine neue Session zur Akinator API und liefert die SessionID zurück
*/
exports.createSession = function(cb){

  request(url + 'new_session?partner=1&player=alexinator', function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // Sucessfull request save data
        var rs = JSON.parse(body);
        var sessionID = rs.parameters.identification.session;
        var signatureID = rs.parameters.identification.signature;
        var stepNu = rs.parameters.step_information.step;
        var questionStr = rs.parameters.step_information.question;

        /* RETURN LOCIG */
        if(cb){
          cb({
            session: sessionID,
            signature: signatureID,
            step: stepNu,
            question: questionStr
          });
        }else{// if cb
          return {session: sessionID,signature: signatureID, step: stepNu, question: questionStr }
        }
      } else {// if request
        if(cb) cb(false);
        else return false;
      }
  });
}

exports.getQuestion = function(rs){
  var question = rs.response.parameters.step_information.question;
  return question;
}

exports.sendAnswer = function(answerId, session, signature, step) {

  request(url + 'answer?session=' + session + '&signature=' + signature + '&step=' + step + '&answer=' + answerId, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var rs = JSON.parse(body);
        rs = self.getQuestion(rs);
      }
  });

}

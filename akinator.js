var winston = require('winston');
var request = require('request');

var url = 'http://api-de1.akinator.com/ws/';

/*
  createSession
  Öffnet eine neue Session zur Akinator API und liefert die SessionID zurück

*/
exports.createSession = function(){
  return new Promise(
    function (resolve, reject) {
      request(url + 'new_session?partner=1&player=alexinator', function(error, response, body) {
        if (!error && response.statusCode === 200) {
          // Sucessfull request save data
          var rs = JSON.parse(body);
          var session_id   = rs.parameters.identification.session;
          var signature_id = rs.parameters.identification.signature;
          var step_nu      = rs.parameters.step_information.step;
          var question_str = rs.parameters.step_information.question;

            resolve({session: session_id, signature: signature_id, step: step_nu, question: question_str});
          }else{
            reject(new Error('Request failed cant get session'));
          }
        });
    });
};


/**
sendAnswer
sends the players answer to the akinator server
Returns a new question from the akinator API.

Parameter:
  answerId:   the Players answer
  session:    the Akinator SessionID of the player
  signature:  the Akinator signature
  step:       the Step number
  cb:         the callback function

*/
exports.sendAnswer = function(answer, session, signature, step) {

  return new Promise(
    function (resolve, reject) {
      var answerId;
      // Set the answerID
      switch (answer.toLowerCase()) {
        case 'ja':
          answerId = 0;
          break;

        case 'nein':
          answerId = 1;
          break;

        case 'ich weiß es nicht':
        case 'ich weiß nicht':
        case: 'weiß ich nicht'
          answerId = 2;
          break;

        case 'wahrscheinlich':
          answerId = 3;
          break;

        case 'wahrscheinlich nicht':
          answerId = 4;
          break;

        default:
          reject({ // return an error
            error_text: 'Das ist leider keine Gültige Antwort',
            error: 1
          });
          break;
      }

      request(url + 'answer?session=' + session + '&signature=' + signature + '&step=' + step + '&answer=' + answerId, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          //TODO: check if question is null
          checkWin(JSON.parse(body), function(rs ,win){
            if(win){ // if akinator try to guess
              // Get the person akinator trys to guess
              request({
                  headers: {
                      'dataType': 'jsonp'
                    },
                    uri: url + 'list?session=' +session+ '&signature=' +signature+'&step=' +step+ '&size=2&max_pic_width=246&max_pic_height=294&pref_photos=VO-OK&mode_question=1',
                    method: 'GET'
                  }, function(error, response, body) {
                    if (!error && response.statusCode == 200) { // Rewquest success
                      var rsL = JSON.parse(body);
                      winston.log('info', 'GEWONNNNENN WUHUHUHUHHUH\r\n\r\n');

                      resolve({
                        name: rsL.parameters.elements[0].element.name,
                        des:  rsL.parameters.elements[0].element.description,
                        pic:  rsL.parameters.elements[0].element.absolute_picture_path,
                        question: rs.parameters.question, /* Fals Person nicht die richtige ist */
                        step: rs.parameters.step
                      });
                    }else {
                      reject({
                        error_text: 'Akinator gibt leider keine Antwort',
                        error: response.statusCode
                      });
                    }// request fails
              }); // Request
            }else{ // akinator gives a new question
              resolve({
                question: rs.parameters.question,
                step: rs.parameters.step
              });
            }
          })
        }else{ // if request fails
          winston.log('error', 'Request from akinator-API fehlerhaft');
          reject({
            error_text: 'Akinator gibt leider keine Antwort',
            error: response.statusCode
          });
        }
      });
    });// Promise
};

checkWin = function(rs, cb){
  // if elements is given akinator trys to guess the person
  if(rs.parameters.progression >=99.5){
    cb(rs, true);
  }
  else{
    cb(rs, false);
  }
}

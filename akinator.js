var winston = require('winston');
var request = require('request');

var url = 'http://api-de1.akinator.com/ws/';

/*
  createSession
  Öffnet eine neue Session zur Akinator API und liefert die SessionID und die erste Frage zurück
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
  answerId:   Players answer
  session:    Akinator SessionID of the player
  signature:  Akinator signature
  step:       Step number

*/
exports.sendAnswer = function(answer, session, signature, step) {

  return new Promise(
    function (resolve, reject) {
      var answerId;
      // Set the answerID
      switch (answer.toLowerCase()) {
        case 'jaja':
        case 'sicherlich':
        case 'sicher':
        case 'bestimmt':
        case 'definitiv':
        case 'ganz bestimmt':
        case 'ja':
          answerId = 0;
          break;

        case 'definitiv nein':
        case 'ganz sicher nicht':
        case 'ganz bestimmt nicht':
        case 'bestimmt nicht':
        case 'nein':
          answerId = 1;
          break;

        case 'woher soll ich das wissen':
        case 'keinen Plan':
        case 'kein Plan':
        case 'keine ahnung':
        case 'ich weiß es nicht':
        case 'ich weiß nicht':
        case 'weiß ich nicht':
          answerId = 2;
          break;

        case 'sehr wahrscheinlich':
        case 'sehr wahrscheinlich':
        case 'ich glaube schon':
        case 'ich denke schon':
        case 'wahrscheinlich':
          answerId = 3;
          break;

        case 'ich denke nicht':
        case 'ich glaube nicht':
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
                        id:   rsL.parameters.elements[0].element.id,
                        name: rsL.parameters.elements[0].element.name,
                        des:  rsL.parameters.elements[0].element.description,
                        pic:  rsL.parameters.elements[0].element.absolute_picture_path.replace('http','https'),
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

/**
sendWin
Tells akinator API the guessed Person is right!
Parameter:
  id:   id of the list item
  text: description of the person
*/
exports.sendWin = function(id, text) {

  request("http://de.akinator.com/personnages/valide/list/"+id+"/"+text+"/1", function(error, response, body) {

  });
};

checkWin = function(rs, cb){
  // if elements is given akinator trys to guess the person
  if(rs.parameters.progression >=99){
    cb(rs, true);
  }
  else{
    cb(rs, false);
  }
}

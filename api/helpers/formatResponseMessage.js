'use strict';

function formatResponseMessage(message, id) {
  let returnMessage = {
    "message": message
  }

  if(typeof id !== 'undefined'){
    returnMessage['id'] = id;
  }

  return returnMessage;
}

module.exports = formatResponseMessage;

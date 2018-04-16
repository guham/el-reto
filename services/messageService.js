'use strict';

module.exports = function messageService() {
  return {
    createResponse: (id, msg) => {
      return {
        qid: id,
        response: '<div data-rid="'+id+'" class="mb-2 lg:mb-4 h-auto rounded p-3 bg-grey-light">'+msg+'</div>',
      }
    },
  }
};

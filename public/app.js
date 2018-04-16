let message = $('#message'),
    messages = $('#messages'),
    btn = $('#send');

function process(e) {
  e.preventDefault();

  if (!message.val().length) {
    return;
  }

  // generate unique ID for this message
  // in order to append bot response below the original question
  let data = $('form').serializeArray(),
      id = '_' + Math.random().toString(36).substr(2, 9);

  data.push({name: 'id', value: id});

  messages.append('<div data-qid="'+id+'" class="mb-2 lg:mb-4 h-auto rounded p-3 bg-blue-light text-right">'+message.val()+'</div>');
  message.val('');

  $.ajax({
    type: 'POST',
    url: 'send',
    data: $.param(data),
    timeout: 20000,
    success: res => {
      $('div[data-qid="'+res.qid+'"]').after(res.response);
      messages.scrollTop(messages.prop('scrollHeight'));
    },
    error: (jqXHR, status, errorThrown) => {
      alert(status+': '+errorThrown);
    }
  });
}

btn.on('click', process);

message.on('keypress', e => {
  if (e.which === 13) {
    process(e);
  }
});

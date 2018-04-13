let message = $('#message'),
    messages = $('#messages'),
    btn = $('#send');

function process(e) {
  e.preventDefault();

  if (!message.val().length) {
    return;
  }

  messages.append('<div class="mb-4 h-auto rounded p-3 bg-blue-light text-right">'+message.val()+'</div>');

  $.ajax({
    type: 'POST',
    url: 'send',
    data: $('form').serialize(),
    timeout: 20000,
    success: data => {
      messages.append(data);
      messages.scrollTop(messages.prop('scrollHeight'));
    },
    error: (jqXHR, status, errorThrown) => {
      // todo
    },
    complete: (jqXHR, status) => {
      message.val('');
    }
  });
}

btn.on('click', process);

message.on('keypress', e => {
  if (e.which === 13) {
    process(e);
  }
});

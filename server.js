'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const rp = require('request-promise');
require('dotenv').config();

const PORT = 8080;
const HOST = '0.0.0.0';

const apiOptions = {
  uri: process.env.API_URI,
  qs: {
    log: 1,
    key: process.env.API_KEY,
    session_id: Date.now()
  },
  json: true
};

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.urlencoded({ extended: false }));

app.all(['/', '/send'], function (req, res, next) {
  console.log('Route: "'+req.route.path+'", Method: "'+req.method+'", Params: '+JSON.stringify(req.params));
  next();
});

app.route('/')
  .get((req, res) => {
    // go to homepage => new conversation => new session id
    apiOptions.qs.session_id = Date.now();
    res.render('index', {title: 'El Reto'});
  });

app.route('/send')
  .post((req, res) => {
    let options = JSON.parse(JSON.stringify(apiOptions));
    options.qs.question = req.body.q;

    rp(options)
      .then(response => {
        console.log(response);
        console.log('\r');
        let message = response.current_response.message;
        if (!message.length) {
          message = response.current_response.answer_complement;
        }
        res.send('<div class="mb-4 h-auto rounded p-3 bg-grey-light">'+message+'</div>');
      })
      .catch(err => {
        console.log(err);
        console.log('\r');
        res.send('<div class="mb-4 h-auto rounded p-3 bg-grey-light">'+err.message+'</div>');
      });
  });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
console.log(`Env: ` + app.get('env'));
console.log('API_KEY: ' + process.env.API_KEY);
console.log('API_URI: ' + process.env.API_URI);

'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const messageService = require('./services/messageService');
require('dotenv').config();

const PORT = 8080;
const HOST = '0.0.0.0';

const POKEMON_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const POKEAPI = 'https://pokeapi.co/api/v2/pokemon/';

const API_OPTIONS = {
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
    API_OPTIONS.qs.session_id = Date.now();
    res.render('index');
  });

app.route('/send')
  .post((req, res) => {
    let options = JSON.parse(JSON.stringify(API_OPTIONS));
    let questionId = req.body.id;
    options.qs.question = req.body.q;

    rp(options)
      .then(response => {
        console.log(response);
        console.log('\r');
        let message = response.current_response.message;
        if (!message.length) {
          message = response.current_response.answer_complement;
        }
        res.send(messageService().createResponse(questionId, message));
      })
      .catch(err => {
        console.log(err);
        console.log('\r');
        res.send(messageService().createResponse(questionId, err.message));
      });
  });

app.route('/infos')
  .get((req, res) => {
    let promises = POKEMON_IDS.map((id) => {
      let pokeOptions = {
        uri: POKEAPI + id + '/',
        json: true
      };

      return rp(pokeOptions)
        .then(response => {
          let pokemon = {
            id: id,
            name: response.name,
            weight: 0,
            height: 0,
            abilities: [],
            types: [],
            stats: {},
            moves: [],
          };

          let abilities = response.abilities;
          let abilitiesArr = [];
          abilities.forEach(ability => {
            abilitiesArr.push(ability.ability.name);
          });
          pokemon.abilities = abilitiesArr;

          let stats = response.stats;
          stats.forEach(stat => {
            pokemon.stats[stat.stat.name] = stat.base_stat;
          });

          let moves = response.moves;
          let movesArr = [];
          moves.forEach(move => {
            movesArr.push(move.move.name);
          });
          pokemon.moves = movesArr;

          pokemon.weight = response.weight;
          pokemon.height = response.height;

          let types = response.types;
          let typesArr = [];
          types.forEach(type => {
            typesArr.push(type.type.name);
          });
          pokemon.types = typesArr;

          return pokemon;
        })
        .catch(err => {
          console.log(err);
        });
    });

    Promise.all(promises).then(infos => {
      console.log('Fetched informations from Pokeapi: done.');
      res.render('infos', {infos: JSON.stringify(infos, null, 4)});
    });
  });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
console.log(`Env: ` + app.get('env'));
console.log('API_KEY: ' + process.env.API_KEY);
console.log('API_URI: ' + process.env.API_URI);

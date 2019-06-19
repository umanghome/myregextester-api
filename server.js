'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const Request = require('request');

const router = express.Router();

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

function createError(code, description) {
  const error = {
    error: {
      code,
    }
  };

  if (description) {
    error.error.description = description;
  }

  return error;
}

function keyMiddleware (request, response, next) {
  const {
    key
  } = request.query;

  if (!key) {
    return response.send(401);
  }

  next();
}

app.use(keyMiddleware);

const REGEX_REGEX = /<u>Optimized Match Pattern\:<\/u><br \/><span style="color:#000066;">(.*?)<br /;

function findRegex (body) {
  body = body.replace(/\n/g, ''); // Replace line-breaks

  const matches = body.match(REGEX_REGEX);

  const found = matches[1];

  if (!found) {
    return;
  }

  return found.replace(/<wbr>/g, '');
}

app.get('/', (request, response) => {
  response.send('Root!');
});

app.get('/optimize', (request, response) => {
  response.send('Hello, world');
})

app.post('/optimize', (request, response) => {
  const {
    regex,
  } = request.body;

  if (!regex) {
    return response.status(400).send(createError('MISSING_PARAMS'));
  }

  Request({
    method: 'POST',
    url: 'https://myregextester.com/index.php',
    formData:
    {
      match: regex,
      cb_showarray: 'yes',
      cb_optimize: 'yes',
      'cb_lang[]5': 'js',
      dd_oper: 'match_all',
      dd_delim: '/',
      submit: 'Submit'
    }
  }, function (error, res, body) {
    if (error) {
      return response.status(502).send(createError('REGEX_SERVICE_DOWN'));
    }

    const foundRegex = findRegex(body);

    if (foundRegex) {
      return response.send({
        regex: findRegex(body)
      });
    } else {
      return response.send(createError('REGEX_NOT_FOUND'));
    }
  });
});

module.exports = app;
module.exports.handler = serverless(app);
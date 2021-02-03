'use strict';

//bring in dependencies 
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');


// application setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

//application configurations (middleware)  //express middleware

//view engine
app.set('view engine', 'ejs'); //how you can tell you're using ejs at a quick glance

// send a public facing directory  for our CSS
app.use(express.static('./public'));

// Database conection
// const client = new pg.client(process.env.DATABASE_URL);// TAKE IN PATH OF DATABASE SERVER


// create a default route
// app.get('/', homepage);
// app.get('/new', searchPage);
// app.get('/', favoritePage);

app.use('*', (req, res) => {
  res.status(404).send('Something is wrong');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));



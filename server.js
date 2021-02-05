'use strict';

//bring in dependencies 
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


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
const client = new pg.Client(process.env.DATABASE_URL);// TAKE IN PATH OF DATABASE SERVER


// create a default route
app.get('/shows', tvShowHandler);
// app.get('/new', savedMovie);
// app.get('/', favoritePage);


function tvShowHandler(req, res) {
  const url = `https://api.tvmaze.com/search/shows?q=dogs`;
  console.log(url);
  superagent.get(url).then(Info => {
    console.log('', Info.body);
    const shows = Info.body;
    console.log(shows);
    const updatedInfo = shows.map(tvInfo => new TvShow(tvInfo));
    // res.send(updatedInfo);
    res.render('tvshow.ejs', {values: updatedInfo});
  }).catch(error => console.log(error));
}
function TvShow(data){
  this.id = data.show.id;
  this.summary = data.show.summary;
  this.name = data.show.name;
  this.url = data.show.url;
  this.image = data.show.image ? data.show.image.original : " ";
  console.log(data);
}


app.use('*', (req, res) => {
  res.status(404).send('Something is wrong');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));



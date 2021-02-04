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


const RECIPE_API_KEY = process.env.RECIPE_API_KEY;





// create a default route
app.get('/shows', tvShowHandler);
// app.get('/new', savedMovie);
// app.get('/', favoritePage);


<
function tvShowHandler(req, res) {
  const url = `https://api.tvmaze.com/search/shows?q=dogs`;
  console.log(url);
  superagent.get(url).then(Info => {
    console.log('', Info.body);
    const shows = Info.body;
    console.log(shows);
    const updatedInfo = shows.map(tvInfo => new TvShow(tvInfo));
    res.send(updatedInfo);
  }).catch(error => console.log(error));
}
function TvShow(data){
  this.id = data.show.id;
  this.title = data.show.title;
  this.name = data.show.name;
  this.url = data.show.url;

// app.use('*', (req, res) => {
//   res.status(404).send('Something is wrong');
// });

// ---------------- COCKTAILS API ------------------------
app.get('/', cocktailHandler);
// app.get('showDrinks', drinkDetails);

function cocktailHandler(req, res) {
  // let drinkType = request.query.drinkType;
  // let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${drinkType}`;
  let url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=Vodka';

  superagent.get(url)
    .then(value => {
      let drinkSearch = value.body.drinks;
      let cocktailIds = [];
      drinkSearch.forEach(drink => {
        let newdrink = new CocktailGenerator(drink);
        cocktailIds.push(newdrink);
      });
      res.status(200).send(cocktailIds);
    })
    .catch(err => {
      console.log(err);
    });
}

// function drinkDetails(req, res) {
//   let url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita';

// }

function CocktailGenerator(drink) {
  this.idDrink = drink.idDrink;
  this.drinkName = drink.strDrink;
  this.img = drink.strDrinkThumb;
}





app.get('/results', findRecipe);


// Recipe Details using an id key



function findRecipe(req, res) {
  const url = 'https://api.spoonacular.com/recipes/complexSearch';
  superagent.get(url)
    .query({
      apiKey: RECIPE_API_KEY,
      query: req.query.query,
      number: 5,
      instructionsRequired: true
    })
    .then(detailsIfo => {
      console.log('=========', detailsIfo.body);
      const recipeObj = detailsIfo.body.results;
      const recipeData = recipeObj.map(recipeToShow => new RecipeObject(recipeToShow));
      console.log(recipeData);
      res.render('/results', { recipe: recipeData });

    }).catch(error => console.error(error));
}


function RecipeObject(data) {
  this.title = data.title;
  this.id = data.id;
  this.image = data.image;
  // this.ingredients = data.ingredients;

}

// -------------------  Spotify API  ----------------------//


app.get('/SpotifyPlaylist', playlistHandler);


const SpotifyWebAPI = require('spotify-web-api-node');
// scopes = ['user-read-private'];
const SpotifyClientID = process.env.SpotifyClientID;
const SpotifySecretID = process.env.SpotifySecretID;
// const redirectURL = process.env.redirectURL;
const spotifyApi = new SpotifyWebAPI({ clientId: SpotifyClientID, clientSecret: SpotifySecretID });


function playlistHandler(req, res) {
  spotifyApi.authorizationCodeGrant()
    // const { access_token, refresh_token} = data.body
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.searchPlaylists('Date Night', { limit: 3 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new SpotifyPlaylist(playlist));
          res.status(200).render('spotfy.ejs', { playlists });
        })
        .catch(err => errorHandler(req, res, err));
    })
    .catch(err => errorHandler(req, res, err));
}

function SpotifyPlaylist(playlist) {
  this.description = playlist.description;
  this.url = playlist.external_urls.spotify;
  this.image = playlist.images[0].url;
  this.name = playlist.name;
  this.spotifyId = playlist.id;
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




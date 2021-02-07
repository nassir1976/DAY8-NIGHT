'use strict';

//bring in dependencies 
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// application setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // allow to PUT and DELETE

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
app.get('/', homeHandler);

function homeHandler(req, res) {
  res.status(200).render('index');
}



function tvShowHandler(req, res) {
  const searchterm = req.query.keyword;
  console.log(searchterm);
  const url = `https://api.tvmaze.com/search/shows?q=${searchterm}`;
  console.log(url);
  superagent.get(url).then(Info => {
    console.log('', Info.body);
    const shows = Info.body;
    console.log(shows);
    const updatedInfo = shows.map(tvInfo => new TvShow(tvInfo));
    // res.send(updatedInfo);
    res.render('tvshow.ejs', { values: updatedInfo });
  }).catch(error => console.log(error));
}
function TvShow(data) {
  this.id = data.show.id;
  this.summary = data.show.summary;
  this.name = data.show.name;
  this.url = data.show.url;
  this.image = data.show.image ? data.show.image.original : " ";
  console.log(data);
}
// app.use('*', (req, res) => {
//   res.status(404).send('Something is wrong');
// });

// ---------------- COCKTAILS API ------------------------


app.get('/', cocktailHandler);
// app.get('showDrinks', drinkDetails);
app.get('/cocktailResults', cocktailHandler);
app.get('/cocktailSearch', showCocktailSearch);
app.get('/tvshowSearch', showTvShowSearch);
app.get('/recipeSearch', showRecipeSearch);
app.get('/aboutus', getAboutUs);

function showTvShowSearch(req, res) {
  res.status(200).render('tvshowSearch');
}

function showCocktailSearch(req, res) {
  res.status(200).render('cocktailSearch');
}

function showRecipeSearch(req, res) {
  res.status(200).render('recipeSearch');
}

function showSpotifySearch(req, res) {
  res.status(200).render('spotifySearch');
}

function getAboutUs(req, res) {
  res.status(200).render('aboutus');
}





function cocktailHandler(req, res) {
  console.log('req.qery...', req.query);
  let drinkType = req.query.keyword;
  let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${drinkType}`;

  superagent.get(url)
    .then(value => {
      console.log(value);
      let drinkSearch = value.body.drinks;
      let cocktailIds = [];
      drinkSearch.forEach(drink => {
        let newdrink = new CocktailGenerator(drink);
        cocktailIds.push(newdrink);
      });
      res.status(200).render('cocktailResults', { data: cocktailIds });
    })
    .catch(err => {
      console.log(err);
    });
}

function CocktailGenerator(drink) {
  this.idDrink = drink.idDrink;
  this.drinkName = drink.strDrink;
  this.img = drink.strDrinkThumb;
}


// function drinkDetails(req, res) {
//   let url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita';








app.get('/recipeResults', findRecipe);
app.post('/recipeFavorites', saveRecipe);
app.delete('/delete/:recipe_id', deleteRecipe);
app.get('/recipeFavorites', getFavorites);







// Recipe Details using an id key

function findRecipe(req, res) {
  const url = 'https://api.spoonacular.com/recipes/complexSearch';
  superagent.get(url)
    .query({
      apiKey: RECIPE_API_KEY,
      cuisine: req.query.keyword,
      number: 10,
      instructionsRequired: true
    })
    .then(detailsIfo => {
      // console.log('=========', detailsIfo.body);

      const recipeObj = detailsIfo.body.results;
      const recipeData = recipeObj.map(detailsIfo => new RecipeObject(detailsIfo));
      // res.status(200).send(recipeData);
      res.render('./recipeResults', { recipe: recipeData });

    }).catch(error => console.error(error));
}

// ============== add(save) to database==========

function saveRecipe(req, res) {
  let SQL = `INSERT INTO recipes (title, image, ingredients, cuisines) VALUES ($1, $2, $3, $4 ) RETURNING *`;
  console.log('line183', req.body);
  const values = [req.body.title, req.body.image, req.body.ingredients, req.body.cuisines];
  client.query(SQL, values)
    .then(values => {
      res.redirect('/');
      // res.render('recipeFavorites.ejs', { results: values.rows[0] });
    }).catch(error => console.log(error));

}



function deleteRecipe(req, res) {
  console.log('req.params>>>>>>>>>>', req.params);
  const SQL = 'SELECT * FROM recipes WHERE id=$1;';
  const values = [req.params.id];
  client.query(SQL, values)
    .then(values => {
      // console.log(">>>>>>>>>>", results.rows);
      res.redirect('/');
      // render('recipeFavorites.ejs', { results: results.rows[0] });

    });

}
// =========rendered from database to favoritepage=======


function getFavorites(req, res) {
  const SQL = 'SELECT * FROM recipes;';
  console.log('line212');
  return client.query(SQL)
    .then(results => {

      console.log("line215", results.rows);

      res.render('./recipeFavorites', { recipe: results.rows });
    });
}




function RecipeObject(data) {
  this.title = data.title;
  this.image = data.image;
  this.ingredients = data.ingredients;
  this.cuisines = data.cuisines;

}

// -------------------  Spotify API  ----------------------//


app.get('/SpotifyPlaylist', playlistHandler);
app.get('/spotifySearch', showSpotifySearch);
app.post('/spotifySearch', searchPlaylistHandler);

const SpotifyWebAPI = require('spotify-web-api-node');
const { render } = require('ejs');
// scopes = ['user-read-private'];
const SpotifyClientID = process.env.SpotifyClientID;
const SpotifySecretID = process.env.SpotifySecretID;
// const redirectURL = process.env.redirectURL;
const spotifyApi = new SpotifyWebAPI({ clientId: SpotifyClientID, clientSecret: SpotifySecretID });

function searchPlaylistHandler(req, res) {
  let search = req.body.query;
  spotifyApi.authorizationCodeGrant()
    .then(data => {
      spotifyApi.setAccessToken(data.body['access token']);
      spotifyApi.searchPlaylists(search, { limit: 5 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new SpotifyPlaylist(playlist));
          res.status(200).render('pages/playlist', { playlists });
        });
    });
}


function playlistHandler(req, res) {
  spotifyApi.authorizationCodeGrant()
    // const { access_token, refresh_token} = data.body
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.searchPlaylists('Date Night', { limit: 3 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new SpotifyPlaylist(playlist));
          res.status(200).render('spotifySearch.ejs', { playlists });
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


function errorHandler(req, res, err) { res.status(500).send(`Error: ${err}`); }

// app.use('*', (req, res) => {
//   res.status(404).send('Something is wrong');
// });


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));

'use strict';

//bring in dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { render } = require('ejs');
const { log } = require('console');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// application setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

//application configurations (middleware)  //express middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 

//view engine
app.set('view engine', 'ejs'); 

// send a public facing directory  for our CSS
app.use(express.static('./public'));

// Database conection
const client = new pg.Client(process.env.DATABASE_URL);// 

const RECIPE_API_KEY = process.env.RECIPE_API_KEY;

// Routes
app.get('/', homeHandler);
app.get('/aboutus', getAboutUs);

app.get('/tvshowSearch', showTvShowSearch);
app.get('/shows', tvShowHandler);
app.post('/saved', savedMovies);
app.delete('/delete/:id', deleteTvShow);

app.get('/cocktailSearch', showCocktailSearch);
app.get('/cocktailResults', cocktailHandler);
app.post('/faves', saveCocktail);
app.get('/cocktailFavorites', showCocktailFaves);
app.delete('/deleteCocktail/:id', deleteCocktail);


app.get('/recipeSearch', showRecipeSearch);
app.get('/recipeResults', findRecipe);
app.post('/recipeFavorites', saveRecipe);
app.delete('/deleteRecipe/:recipe_id', deleteRecipe);
app.get('/recipeFavorites', getFavorites);

app.get('/favorites', favoritesMovies);


// FUNCTIONS FOR RENDERING HOMEPAGE & ABOUT US PAGE
function homeHandler (req, res){
  res.status(200).render('index');
}
// async function homeHandler(req, res) {   // eslint-disable-line
//   let playlist = await getMyData();
//   console.log({playlist});
//   res.status(200).render('index');
// }

function getAboutUs(req, res) {
  res.status(200).render('aboutus');
}

// --------TV SHOW API ----------
function showTvShowSearch(req, res) {
  res.status(200).render('tvshowSearch');
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
    res.render('tvshowResults', { values: updatedInfo, searchterm });
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

function savedMovies(req, res) {
  console.log(req.body.image);
  let SQL = `INSERT INTO tvshows (tvshow_name, summary, url, img) VALUES ($1, $2, $3, $4) RETURNING *;`;
  const savedShows = [req.body.tvshow_name, req.body.summary, req.body.url, req.body.image];
  // console.log(savedShows);
  client.query(SQL, savedShows).then(() => {
    res.redirect(`/shows?keyword=${req.body.searchterm}`);
  }).catch(error => console.log(error));
}

function favoritesMovies(req, res) {
  const getSavedShows = `SELECT * FROM tvshows`;
  client.query(getSavedShows).then(saved => {
    const resultData = saved.rows;
    const newSaved = resultData.map(values => {
      return values.names;
    });
    console.log(resultData[0]);
    res.render('tvshowFavorites', {data: resultData});
    return newSaved;
  });
}

function deleteTvShow (req, res) {
  const id = req.params.id;
  let SQL = 'DELETE FROM tvshows WHERE id=$1;'; 
  let values=[id];
  client.query(SQL, values).then(()=>{
    res.status(200).redirect('/favorites');
  });
}





// app.get('/', cocktailHandler);
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

function cocktailHandler(req, res) {
  // console.log('req.qery...', req.query);
  let drinkType = req.query.keyword;
  let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${drinkType}`;

  superagent.get(url)
    .then(value => {
      // console.log(value);
      let drinkSearch = value.body.drinks;
      // console.log(drinkSearch);
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

function saveCocktail (req, res){
  // console.log('req..', req.body);
  const SQL = 'INSERT INTO cocktails (drinkName, img) VALUES ($1, $2) RETURNING *;';
  let params = [req.body.drinkName, req.body.img];

  client.query(SQL, params)
    .then(data => {
      console.log(`added ${params[0]} to database`);
    });
}

function showCocktailFaves (req, res){
  let SQL = 'SELECT * FROM cocktails'

  client.query(SQL)
    .then(results => {
      res.render('cocktailFavorites', {data: results.rows});
    });
}

function deleteCocktail (req, res) {
  // console.log('req.params', req.params.=);
  let id = req.params.id;
  let SQL = 'DELETE FROM cocktails WHERE id=$1;';
  let value = [id];

  client.query(SQL, value)
    .then(()=>{
      res.status(200).redirect('/cocktailFavorites');
    });
}

function CocktailGenerator(drink) {
  this.idDrink = drink.idDrink;
  this.drinkName = drink.strDrink;
  this.img = drink.strDrinkThumb;
}




// // ------------------- END COCKTAILS API ----------------------------







app.get('/recipeResults', findRecipe);
app.post('/recipeFavorites', saveRecipe);
app.delete('/deleteRecipe/:recipe_id', deleteRecipe);
app.get('/recipeFavorites', getFavorites);





// ------------------- FOOD API ----------------------------


// Recipe Details using an id key

function showRecipeSearch(req, res) {
  res.status(200).render('recipeSearch');
}

function findRecipe(req, res) {
  const url = 'https://api.spoonacular.com/recipes/complexSearch';
  superagent.get(url)
    .query({
      apiKey: RECIPE_API_KEY,
      cuisine: req.query.keyword,
      number: 50,
      instructionsRequired: true
    })
    .then(detailsIfo => {
      // console.log('=========', detailsIfo.body);
      let key  = req.query.keyword
      const recipeObj = detailsIfo.body.results;
      const recipeData = recipeObj.map(detailsIfo => new RecipeObject(detailsIfo,key));
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
      res.redirect(`/recipeResults?keyword=${req.body.keyword}`);
    }).catch(error => console.log(error));

}



function deleteRecipe(req, res) {
  console.log('req.params>>>>>>>>>>', req.params.id);
  const SQL = 'DELETE FROM recipes WHERE id=$1;';
  let id = req.params.recipe_id;
  let value=[id];
  client.query(SQL, value)
    .then(()=> {
      res.redirect('/recipeFavorites');
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

function RecipeObject(data,pot) {
  this.keyword= pot;
  this.title = data.title;
  this.image = data.image;
  this.ingredients = data.ingredients;
  this.cuisines = data.cuisines;
}


// -------------SPOTIFY---------------

// function showSpotifySearch(req, res) {
//   res.status(200).render('spotifySearch');
// }


// async function homeHandler(req, res) {   // eslint-disable-line
//   let playlist = await getMyData();
//   console.log({playlist});
// }

// const fs = require('fs')
// const SpotifyWebApi = require('spotify-web-api-node');
// const token = "BQDfYegFO-BX9vYP0I-nGEfdjUr1NI57GvDrNI-npeKjKejJAMFO2etyT_ItUpNXhxff7w6V32IcsAkgesDfExxwTIVacPR18vYZehdcnkHpVXkS5mcRgOTOcq8eGcg6LYOWUsj0bciRL8LfGoSMcA";

// const spotifyApi = new SpotifyWebApi();
// spotifyApi.setAccessToken(token);

// //GET MY PROFILE DATA
// async function getMyData() {
//     const me = await spotifyApi.getMe();
//     // console.log(me.body);
//     let data = await getUserPlaylists(me.body.id);
//     return data;
// }

// //GET MY PLAYLISTS
// async function getUserPlaylists(userName) {
//   const data = await spotifyApi.getUserPlaylists(userName)

//   console.log("---------------+++++++++++++++++++++++++")
//   let playlists = []

//   for (let playlist of data.body.items) {
//     console.log(playlist.name + " " + playlist.id)

//     let tracks = await getPlaylistTracks(playlist.id, playlist.name);
//     // console.log(tracks);
//     playlists.push(tracks);
//     const tracksJSON = { tracks }
//     let data = JSON.stringify(tracksJSON);
//     // fs.writeFileSync(playlist.name + '.json', data);
//   }
//   return playlists;
// }

// //GET SONGS FROM PLAYLIST
// async function getPlaylistTracks(playlistId, playlistName) {

//   const data = await spotifyApi.getPlaylistTracks(playlistId, {
//     offset: 1,
//     limit: 100,
//     fields: 'items'
//   })

//   // console.log('The playlist contains these tracks', data.body);
//   // console.log('The playlist contains these tracks: ', data.body.items[0].track);
//   // console.log("'" + playlistName + "'" + ' contains these tracks:');
//   let tracks = [];

//   for (let track_obj of data.body.items) {
//     const track = track_obj.track
//     tracks.push(track);
//     console.log(track.name + " : " + track.artists[0].name)
//   }

//   console.log("---------------+++++++++++++++++++++++++")
//   return tracks;
// }

// // ------------------- Port Listener ------------------- //

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));

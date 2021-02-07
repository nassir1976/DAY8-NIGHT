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


// const { log } = require('console');
// const { render } = require('ejs');




// application setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // allow to PUT and DELETE

app.use(methodOverride('_method'));


//application configurations (middleware)  //express middleware

//view engine
app.set('view engine', 'ejs'); 

// send a public facing directory  for our CSS
app.use(express.static('./public'));
app.use(methodOverride('_method'));

// Database conection
const client = new pg.Client(process.env.DATABASE_URL);// TAKE IN PATH OF DATABASE SERVER

app.use(express.urlencoded({ extended: true }));


const RECIPE_API_KEY = process.env.RECIPE_API_KEY;

// create a default route
app.get('/shows', tvShowHandler);
app.get('/', homeHandler);
app.post('/saved', savedMovies);
app.get('/favorites', favoritesMovies);
app.delete('/delete/:id', deleteTvShow);



async function homeHandler(req, res) {   // eslint-disable-line
  let playlist = await getMyData();
  console.log({playlist});
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




// app.use('*', (req, res) => {
//   res.status(404).send('Something is wrong');
// });




app.get('/', cocktailHandler);
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

// function showSpotifySearch(req, res) {
//   res.status(200).render('spotifySearch');
// }


function getAboutUs(req, res) {
  res.status(200).render('aboutus');
}




// ---------------- COCKTAILS API ------------------------

app.post('/faves', saveCocktail);
app.get('/cocktailFavorites', showCocktailFaves);
app.delete('/delete/:id', deleteCocktail);

function cocktailHandler(req, res) {
  // console.log('req.qery...', req.query);
  let drinkType = req.query.keyword;
  let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${drinkType}`;

  superagent.get(url)
    .then(value => {
      // console.log(value);
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

function saveCocktail (req, res){
  // console.log('req..', req.body);
  const SQL = 'INSERT INTO cocktails (drinkName, img) VALUES ($1, $2) RETURNING *;';
  let params = [req.body.drinkName, req.body.img];

  client.query(SQL, params)
    .then(data => {
      console.log(`added ${params[0]} to database`);
    })
}

function showCocktailFaves (req, res){
  let SQL = 'SELECT * FROM cocktails'

  client.query(SQL)
    .then(results => {
      res.render('cocktailFavorites', {data: results.rows});
    })
}

function deleteCocktail (req, res) {
  console.log('req.params', req.params.id);
  let id = req.params.id;
  let SQL = 'DELETE FROM cocktails WHERE id=$1;';
  let value = [id];

  client.query(SQL, value)
    .then(()=>{
      res.status(200).redirect('/cocktailFavorites');
    })
}





// ------------------- END COCKTAILS API ----------------------------







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



const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQDfYegFO-BX9vYP0I-nGEfdjUr1NI57GvDrNI-npeKjKejJAMFO2etyT_ItUpNXhxff7w6V32IcsAkgesDfExxwTIVacPR18vYZehdcnkHpVXkS5mcRgOTOcq8eGcg6LYOWUsj0bciRL8LfGoSMcA";

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
async function getMyData() {
    const me = await spotifyApi.getMe();
    // console.log(me.body);
    let data = await getUserPlaylists(me.body.id);
    return data;
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName)

  console.log("---------------+++++++++++++++++++++++++")
  let playlists = []

  for (let playlist of data.body.items) {
    console.log(playlist.name + " " + playlist.id)

    let tracks = await getPlaylistTracks(playlist.id, playlist.name);
    // console.log(tracks);
    playlists.push(tracks);
    const tracksJSON = { tracks }
    let data = JSON.stringify(tracksJSON);
    // fs.writeFileSync(playlist.name + '.json', data);
  }
  return playlists;
}

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId, playlistName) {

  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: 'items'
  })

  // console.log('The playlist contains these tracks', data.body);
  // console.log('The playlist contains these tracks: ', data.body.items[0].track);
  // console.log("'" + playlistName + "'" + ' contains these tracks:');
  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track);
    console.log(track.name + " : " + track.artists[0].name)
  }

  console.log("---------------+++++++++++++++++++++++++")
  return tracks;
}

// ------------------- Port Listener ------------------- //

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));

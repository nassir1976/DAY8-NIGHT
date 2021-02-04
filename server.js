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
// app.get('/', homepage);
// app.get('/new', searchPage);
// app.get('/', favoritePage);


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


app.use('*', (req, res) => {
  res.status(404).send('Something is wrong');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`now listening on port ${PORT}`);
    });
  }).catch(error => console.error(error));



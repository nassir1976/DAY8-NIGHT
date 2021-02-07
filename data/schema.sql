DROP TABLE IF EXISTS cocktails;

CREATE TABLE cocktails(
  id SERIAL PRIMARY KEY,
  drinkName VARCHAR(255),
  img VARCHAR(255)
);


DROP TABLE IF EXISTS tvshows;

CREATE TABLE tvshows(
  id SERIAL PRIMARY KEY,
  tvshow_name VARCHAR(255),
  summary VARCHAR(3000),
  url VARCHAR(255),
  img VARCHAR(255)
);

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  image VARCHAR(255),
  ingredients VARCHAR(255),
  cuisines VARCHAR(255)


);

DROP TABLE IF EXISTS spotify;

CREATE TABLE spotify(
  id SERIAL PRIMARY KEY,
  playlist_name VARCHAR(255),
  description VARCHAR(3000),
  url VARCHAR(255),
  img VARCHAR(255)
);

DROP TABLE IF EXISTS cocktails;

CREATE TABLE cocktails(
  id SERIAL PRIMARY KEY,
  drink_name VARCHAR(255),
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
  recipes_name VARCHAR(255),
  ingredients VARCHAR(3000),
  cuisines VARCHAR(255),
  img VARCHAR(255)
);

DROP TABLE IF EXISTS spotify;

CREATE TABLE spotify(
  id SERIAL PRIMARY KEY,
  playlist_name VARCHAR(255),
  description VARCHAR(3000),
  url VARCHAR(255),
  img VARCHAR(255)
);

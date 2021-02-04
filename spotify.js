'use strict';

SpotifyClientID = 3bac4b43abce4a9891758cdadbfc2128;
SpotifySecretID = 37ed69f1ddc04991a43b22b542f6958a;
redirectURL = 'https://github.com/nassir1976/DAY8-NIGHT';



const SpotifyWebAPI = require('spotify-web-api-node');
scopes = ['user-read-private'];
const SpotifyClientID = process.env.SpotifyClientID;
const SpotifySecretID = process.env.SpotifySecretID;
const redirectURL = process.env.redirectURL;
const spotifyApi = new SpotifyWebAPI({ clientId: SpotifyClientID, clientSecret: SpotifySecretID});

require('dotenv').config();
app.set('view engine', 'ejs');


// const spotifyApi = new SpotifyWebAPI({
//   clientid: process.env.SpotifyClientID;
//   clientsecret: process.env.SpotifySecretID
//   redirecturl: process.env.redirectURL;
// })


// Help from Youtube (API University, Programming with Mosh), Spotify API docs, and Medium article playing Spotify API by Sirinya Panyawai //

function playlistHandler(req, res) {
    spotifyApi.authorizationCodeGrant()
    // const { access_token, refresh_token} = data.body
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.searchPlaylists('Date Night', { limit: 3 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new Playlist(playlist));
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




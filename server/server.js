// import express
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const Q = require('q');
const moment = require('moment');
const mongoose = require('mongoose');
const app = express();

// model
const Song = require('./models/Song');

// local vars
const _PORT = 3000;
const _URL = 'http://rfm.sapo.pt/';
let tmpMusic = {author:'',music:'', timestamp:''};

// database connection
mongoose.connect('mongodb://localhost:27017/playlist', function(err, res){
  if(err){
    console.log("An error has occurred: " + err);
  }else{
    console.log("Successfully connected to DB");
  }
});

// functions
function rfmScrap(){
  let author=music=timestamp='';
  let result = {};
  var deferred = Q.defer();
  request(_URL, function(error, response, body){
    if(response && response.statusCode === 200){
      let $ = cheerio.load(body);
      author = $('marquee > .autorNoAr');
      music = $('marquee > .musicNoAr');
      result = {
        author : author.text(),
        music : music.text()
      }
      deferred.resolve(result);
    }else{
      deferred.reject(new Error(error));
    }
  });

  return deferred.promise;
}

// Function that runs every 3 minutes and gets the music currently on air
var interval = setInterval(()=>{
  let m = rfmScrap();
  m.then((data)=>{
    if(tmpMusic.author !== data.author){
      tmpMusic = data;
      console.log(data.author + ' - ' + data.music );

      // saves music on database
      saveMusic(tmpMusic);
    }else{
      console.log('Same Music');
    }
  }, function(error){
    console.log('Connection error.');
  })
}, 3*60*1000);

// DB Functions
function saveMusic(newMusic){
  console.log('saveMusic(' + newMusic.author + ', ' + newMusic.music + ')')
  var mus = new Song({
    author : newMusic.author,
    music : newMusic.music
  })

  mus.save(function(err){
    if(err){
      console.log("An error has occurred: " + err);
    }
    console.log("Song Saved!");
  })
}

// Routes
app.get('/musica', (req,res)=>{
  res.end(JSON.stringify(tmpMusic));
})

app.listen(_PORT, ()=>console.log(`Server connected at port ${_PORT}`));

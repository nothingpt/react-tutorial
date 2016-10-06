// import express
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const Q = require('q');
const app = express();

// local vars
const _PORT = 3000;
const _URL = 'http://rfm.sapo.pt/';
// will hold the previous played song.
let tmpMusic = {author:'',music:''};

// functions
/**
 * [rfmScrap description]
 * gets the currently played song
 * @return a promise with a result
 */
function rfmScrap(){
  let author=music=[];
  let result = {};
  var deferred = Q.defer();
  request(_URL, function(error, response, body){
    const $ = cheerio.load(body);
    author = $('marquee > .autorNoAr') || '';
    music = $('marquee > .musicNoAr') || '';
    result = {
      author : author !== ''?author.text():'',
      music : music !== '' ? music.text():''
    }
    deferred.resolve(result);
  });
  return deferred.promise;
}

// Interval that runs every 2 minutes and gets the music currently on air
var interval = setInterval(()=>{
  let m = rfmScrap();
  m.then((data)=>{
    if(data.author !== '' && data.music !== ''){
      if(tmpMusic.author !== data.author){
        tmpMusic = data;
        console.log(data.author + ' - ' + data.music);

        // TODO: Add new song to MongoDB
      }
    }
  })
}, 2*60*1000);

// Routes
app.get('/musica', (req,res)=>{
  res.send(tmpMusic);
})

app.listen(_PORT, ()=>console.log(`Server connected at port ${_PORT}`));

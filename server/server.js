// import express
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const Q = require('q');
const app = express();

// local vars
const _PORT = 3000;
const _URL = 'http://rfm.sapo.pt/';
let tmpMusic = {author:'',music:''};

// functions
function rfmScrap(){
  let author=music=[];
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

// Function that runs every 2 minutes and gets the music currently on air
var interval = setInterval(()=>{
  let m = rfmScrap();
  m.then((data)=>{
    if(tmpMusic.author !== data.author){
      tmpMusic = data;
      console.log(data.author + ' - ' + data.music);
    }else{
      console.log('Same Music');
    }
  }, function(error){
    console.log('Connection error.');
  })
}, 3*60*1000);

// Routes
app.get('/musica', (req,res)=>{
  res.end(tmpMusic);
})

app.listen(_PORT, ()=>console.log(`Server connected at port ${_PORT}`));

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-moment')(mongoose);

var songSchema = new mongoose.Schema({
        author: String,
        music: String,
        tstamp: {type: Date, default: Date.now}
    });
var Song = mongoose.model('Songs', songSchema);

module.exports = Song;

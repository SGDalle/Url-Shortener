require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var validUrl = require('valid-url');
  
    
// bodyparser
const bodyParser = require("body-parser");
// mongoose
const mongoose = require('mongoose')
// Conecting to mongoose (Database)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Creating schema
let Schema = mongoose.Schema
let urlSchema = new Schema({
  original: {type: String, required: true}
})

let Url = mongoose.model("Url", urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// url encode
app.use(bodyParser.urlencoded({extended: false}))


// Creating and finding urls in db
app.post('/api/shorturl', async function (req, res) {
  let original = req.body.url

  // check if url is valid
  if (!validUrl.isWebUri(original)){
    res.json({"error":"Invalid URL"})
  } else{
    //finds if url is already in db
    let findUrl = await Url.findOne({original: original})
    //if url is found, returns it
    if (findUrl) {
      res.json({"original_url": findUrl.original, "short_url": findUrl._id})
      //if url inst in db, create an intance in db then return it
    } else {
      findUrl = new Url({original: original})
      await findUrl.save()
      res.json({"original_url": findUrl.original, "short_url": findUrl._id})
    }
  }
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Get parameters from url
app.get('/api/shorturl/:sUrl', async function (req, res){
  // Atributes url parameter to variable
  let sUrl = req.params.sUrl
  // Finds url using short id in db
  let findSUrl = await Url.findOne({_id: sUrl})
  // Redirect page to Url
  if (findSUrl){
    res.redirect(findSUrl.original)
  } else {
    res.json({"error":"Invalid short URL"})
  }
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

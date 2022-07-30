require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require("body-parser");
const short = require('shortid');
const mongoose = require('mongoose');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const port = process.env.PORT || 3000;
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



mongoose.connect(process.env.MONGO_URI);


var urlschema = new mongoose.Schema({
  original_url: String,
  short_url:String
});


var urlData = mongoose.model('urlData', urlschema);



app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//
async function addUrlToDbAndSendResponse(originalUrl,res){
    let existingData = await urlData.find({'original_url':
    {$exists: true}});
    var url;
    var foundData = await 
    urlData.findOne({"original_url":originalUrl});
    var createAndSavePerson = function(original_url) {
    url = new 
    urlData({original_url:original_url,
             short_url:existingData.length});
    url.save(function(err, data) {
      if (err) return console.error(err);
        console.log(data+" saved to bookstore collection.");
      });  
    }
    if(foundData===null){
      createAndSavePerson(originalUrl);
  //reformat to a different json structure 
      res.json({original_url:url['original_url'],
                short_url:url['short_url']});
    }else{
    // if the url already exists return the data
    return res.json(
    {original_url:foundData['original_url'],    
     short_url:foundData['short_url']}
  );
    
  }
}

app.post('/api/shorturl', async function(req, res) {
  var originalUrl=req.body.url;
  var isUrl;
  try{
     isUrl=new URL(originalUrl);
  }catch(err){
     console.log(err); 
  }
  if(isUrl!=undefined){
    addUrlToDbAndSendResponse(originalUrl,res);
  }else{
      return res.json({error: 'invalid url'});
  }
    
});

app.get('/api/shorturl/:index', async function(req, res) {
  console.log(req.params.index);
  paramUrl=req.params.index;
const result= await urlData.findOne({"short_url":paramUrl});
  
return res.redirect(result['original_url']);

})
;


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});






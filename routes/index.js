var express = require('express');
var router = express.Router();
var prometheus = require("prom-client");
var MongoClient = require('mongodb').MongoClient

// optional to export common cpu and memory related logs 
const collectDefaultMetrics = prometheus.collectDefaultMetrics
collectDefaultMetrics({timeout: 5000});

// connection string
var url = 'mongodb://mongodb-service:27017';
//var url = 'mongodb://10.99.220.104:27018';


// refer https://www.youtube.com/watch?time_continue=642&v=m2zM3zOZl34&feature=emb_logo for more details
// declaration that will be used later to send corrosponding value, Only two data types can be used for custom logs 
const requestcounter = new prometheus.Counter({
  name: 'node_app_request_count',  // name by which it will be appear in prometheus query
  help: 'Total number test parameter', // help or description for the same log
  labelNames: ['myparams'], // optional
})



const histogram = new prometheus.Histogram({
  name: 'random_histogram', // to can be achived by start_time = new Date() and similarly calculating end_time and difference of both under histogram.observe()
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route'],
  buckets: [1,2,5,6,10] // values will be put under any of matching bucket (simply decide this numbers based on values supplied)
})



router.get('/', function(req, res, next) {
  requestcounter.inc();
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { name: "id", address: "a1" };
  dbo.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
  });
  res.render('index', { title: 'insert success, to view data use /get route'});
});



router.get('/histogram', function(req, res, next) {
var random_number = Math.floor(Math.random() * Math.floor(15));
histogram.observe(random_number); // to calculate random value b/w 0 to 15
res.send("done with value: "+ random_number)
});
router.get('/get', function(req, res, next) {
   MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("mydb");
	var collection = dbo.collection('customers');
	collection.find({}).toArray(function(err,docs){
        if (err) throw err;
        console.log(docs);
	res.send(docs)
        db.close();
	});	
  });
});



// To provide all captured  matrices on this /matrics route
router.get('/metrics', function(req, res, next) {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(prometheus.register.metrics())
});


module.exports = router;

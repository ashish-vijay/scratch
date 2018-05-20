var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;

const config = require('./config');

const PORT = process.env.PORT || 8080;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan('dev'));

MongoClient.connect(config.dbString, { useNewUrlParser: true }, (err, database) => {
	assert.equal(null, err);
	console.log('Database connected succesfully');
})

app.get('/', (req, res) => {
	res.send('Hello! The API is at port ' + PORT)
})

app.listen(PORT, (err) => {
	assert.equal(null, err);
	console.log('App started succesfully in port : ' + PORT);
})
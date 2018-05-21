var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var apiRoutes = express.Router();

const assert = require('assert');

const config = require('./config');
var User = require('./app/models/user');

const PORT = process.env.PORT || 8080;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan('dev'));

mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.get('/', (req, res) => {
	res.send('The API is at port ' + PORT)
})

app.get('/setup', (req, res) => {
	var nick = new User({ 
    	name: 'Nick Gonzales', 
    	password: 'password',
    	admin: true 
  	});
  	nick.save((err) => {
  		if(err) console.log(err);
  		console.log('USer saved succesfully');
  		res.json({ sucess: true});
  	});
});

app.listen(PORT, (err) => {
	assert.equal(null, err);
	console.log('App started succesfully in port : ' + PORT);
})

//route to authenticate and give tokens   
apiRoutes.post('/authenticate', (req, res) => {
	User.findOne({name: req.body.name}, (err, user) => {
		if(err) throw err;
		if(!user) {
			res.json({success: false, message: "Authentication failed, user not found"});
		} else if(user){
			if(user.password != req.body.password){
				res.json({success: false, message: "Authentication failed, wrong password"});	
			} else {
				const payload = { admin : user.admin }
				var token = jwt.sign(payload, app.get('superSecret'), {expiresIn: "24h"});
				res.json({success: true, message: "Enjoy your token", token: token})
			}
		}
	});
});

apiRoutes.use((req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token) {
		jwt.verify(token, app.get('superSecret'), (err, decoded) => {
			if(err) return res.json({sucess: false, message: 'Failed to authenticate'});
			else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		 return res.status(403).send({ 
        	success: false, 
        	message: 'No token provided.' 
    	});
	}
});

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
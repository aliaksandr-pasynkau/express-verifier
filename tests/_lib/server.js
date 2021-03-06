'use strict';
/*eslint no-console:0*/

require('colors');

var express = require('express');
var bodyParser = require('body-parser');
var verifier = require('./index');
var app = express();
var path = require('path');
var verify = verifier({
	cwd: path.join(__dirname, '/specs/')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var resource = function (req, res) {
	res.send({
		done: {
			body: req.body,
			query: req.query,
			params: req.params,
			headers: req.headers
		}
	});
};

app.get('/', verify.query(function (required, optional) {
	required('sortby', [
		'type string', { 'contains': [ 'key', 'value' ] }
	]);
	optional('orderby', [
		'type string', {
			'contains': [ 'ASC', 'DESC' ] }
	]);
}), resource);

app.post('/(:id)/', verify('root.yml'), resource);

app.use(function (err, req, res, next) {
	if (err instanceof verifier.Schema.ValidationError) {
		res.status(400);
		res.send({
			error: err
		});
		return;
	}

	next(err);
});

if (!module.parent) {
	var server;

	server = app.listen(3000, function () {
		console.log('>>'.green, 'Server started at ' + ('http://' + server.address().address + ':' + server.address().port).red);
	});
}


// use httpie !!!
// valid
// http GET "http://localhost:3000/some/?sortby=key&orderby=ASC" --json --body
// http GET http://localhost:3000/some/?sortby=key
// echo '{"first_name": "Vasia", "last_name": "Pupkin"}' | http POST http://localhost:3000/123/ content-type:application/json  --json --body

// invalid
// http GET "http://localhost:3000/some/?sortby=key&orderby=123" --json --body


module.exports = app;

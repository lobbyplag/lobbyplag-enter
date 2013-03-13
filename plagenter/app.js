var config = require('./config');
var fs = require('fs');
var express = require('express');
var app = express();
var crypto = require('crypto');

//base data
var data_docs;
var data_directives;

function getDocByID(doc_uid) {
	for (var i = 0; i < data_docs.length; i++) {
		if (data_docs[i].uid === doc_uid) {
			return data_docs[i];
		}
	}
	return null;
}

// configure express
app.configure(function () {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon(__dirname + '/static/favicon.ico'));
	app.use('/static', express.static(__dirname + '/static'));
	//app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.send(500, 'Something broke in me! :.(');
	});
});

app.get('/', function (req, res) {
	res.render('index', { docs: data_docs, directives: data_directives });
});

app.post('/', function (req, res) {
	//console.log('[Server] Epic win, somebody is working');
	if (!req.body.page) {
		res.send('Bitte eine Seitenzahl eingeben');
		return;
	}
	if (isNaN(req.body.page)) {
		res.send('Bitte nur Zahlen für die Seitenzahl eingeben');
		return;
	}
	if (!req.body.doc) {
		res.send('Bitte das Quell-Dokument auswählen');
		return;
	}
	if (!req.body.rel) {
		res.send('Bitte die Stelle in der Direktive auswählen');
		return;
	}
	var doc = getDocByID(req.body.doc);
	if (!doc) {
		res.send('Das Quell-Dokument ist leider unbekannt, bitte neu auswählen');
		return;
	}
	var shasum = crypto.createHash('sha1');
	shasum.update(req.body.rel + req.body.page + req.body.doc + req.body.txtold + req.body.txtnew);
	var id = shasum.digest('hex');
	var data = {doc: doc.filename, doc_uid: req.body.doc, page: req.body.page, relations: [req.body.rel], text: {old: req.body.txtold, new: req.body.txtnew }, uid: id  };
	fs.writeFile(config.dataPathDest + id + '.json', JSON.stringify(data, null, '\t'), function (err) {
		if (err) {
			console.log('error saving ' + id + '.json: ' + err);
			res.send('Beim Speichern ist ein Fehler aufgetreten, bitte nochmal versuchen');
		} else {
			console.log(id + '.json saved');
			res.send('OK, gespeichert. Danke sehr!');
		}
	});
});

function loadData(filename, callback) {
	fs.exists(filename, function (exists) {
		if (exists) {
			fs.readFile(filename, function (err, data) {
				callback(JSON.parse(data));
			});
		} else {
			console.log('"' + filename + '" could not be loaded, please check config.js for the right paths');
			callback();
		}
	});
}

function init(cb) {
	loadData(config.dataPathSource + 'documents.json', function (data) {
		if (data) {
			data_docs = data;
			console.log('documents.json loaded');
			loadData(config.dataPathSource + 'directive.json', function (data) {
				if (data) {
					data_directives = data;
					console.log('directive.json loaded');
					cb();
				}
			});
		}
	});
}

init(function () {
	app.listen(config.port);
	console.log('Server is listening to you on port ' + config.port);
});



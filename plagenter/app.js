var config = require('./config');
var fs = require('fs');
var path = require('path');
var express = require('express');
var moment = require('moment');
var url = require('url');
var app = express();
var crypto = require('crypto');

function getByID(array, propertyname, id) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][propertyname] === id) {
			return array[i];
		}
	}
	return null;
}

String.prototype.expand = function () {
	return this.toString().replace(/([hrcaspit])/g,function (l) {
		switch (l) {
			case "h":
				return "|Title ";
				break;
			case "r":
				return "|Recital ";
				break;
			case "c":
				return "|Chapter ";
				break;
			case "s":
				return "|Section ";
				break;
			case "a":
				return "|Art. ";
				break;
			case "p":
				return "|Par. ";
				break;
			case "i":
				return "|P. ";
				break;
			case "t":
				return "|Text ";
				break;
		}
	}).replace(/^\|/, '').split(/\|/g).join(" - ");
};

//base data
function Data() {
	var me = this;
	me.directive = {data: [], filename: 'directive.json'};
	me.docs = {data: [], filename: 'documents.json'};
	me.lobbyists = {data: [], filename: 'lobbyists.json'};
	me.languages = {data: {}, filename: 'lang.json'}; //obj not array
	me.lobbyistsDocs = [];
	me.getDocByID = function (id) {
		return getByID(me.docs.data, 'uid', id);
	};
	me.getDirectivePartByID = function (id) {
		return getByID(me.directive.data, 'id', id);
	};
	me.getLobbyistByID = function (id) {
		return getByID(me.lobbyists.data, 'id', id);
	};

	me.prepareLobbyistDocs = function () {
		var collect = {};
		me.docs.data.forEach(function (doc) {
			if (!doc.imported) {
				var list = collect[doc.lobbyist_full.title];
				if (!list) {
					list = [];
					collect[doc.lobbyist_full.title] = list;
				}
				list.push(doc);
			}
		});
		var result = [];
		for (var key in collect) {
			if (collect.hasOwnProperty(key)) {
				result.push(
					{lobbyist: key, docs: collect[key]}
				);
			}
		}
		me.lobbyistsDocs = result;
		me.lobbyistsDocs.sort(function (a, b) {
			var al = a.lobbyist.toLowerCase();
			var bl = b.lobbyist.toLowerCase();
			if (al > bl)
				return 1;
			if (al < bl)
				return -1;
			return 0;
		});
	};

	me.connectLobbyists = function () {
		me.docs.data.forEach(function (doc) {
			doc.lobbyist_full = me.getLobbyistByID(doc.lobbyist);
			if (!doc.lobbyist_full) {
				doc.lobbyist_full = {title: 'Unknown'};
			}
		});
	};
}

var
	data = new Data();

// configure express
app.configure('all', function () {
	app.use(express.compress());
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
	res.render('index', { data: data });
});

app.get('/pdf/:pdf', function (req, res) {
	res.render('pdf', { pdf: '/raw/' + req.params.pdf });
});

app.get('/pdfobject/:pdf', function (req, res) {
	res.render('pdfobject', { pdf: '/raw/' + req.params.pdf });
});

app.get('/raw/:pdf', function (req, res) {
	var filename = path.resolve(__dirname, config.rawDataPathSource + req.params.pdf);
	res.sendfile(filename);
});

app.get('/directive/', function (req, res) {
	var url_parts = url.parse(req.url, true),
		query = url_parts.query;
	if (!query.lang)
		query.lang = 'de';
	var d = data.getDirectivePartByID(query.id);
	var text = (d ? d.text[query.lang] : '');
	res.send(text);
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
	var doc = data.getDocByID(req.body.doc);
	if (!doc) {
		res.send('Das Quell-Dokument ist leider unbekannt, bitte neu auswählen');
		return;
	}
	var shasum = crypto.createHash('sha1');
	shasum.update(req.body.rel + req.body.page + req.body.doc + req.body.txtold + req.body.txtnew);
	var id = shasum.digest('hex');
	var newdata = {
		doc: doc.filename,
		doc_uid: req.body.doc,
		page: req.body.page,
		relations: [req.body.rel],
		relationwhere: req.body.where,
		comment: (req.body.what === 'comment'),
		text: {old: req.body.txtold, new: req.body.txtnew },
		uid: id  };
	var filename = path.resolve(__dirname, config.dataPathDest + id + '.json');
	fs.writeFile(filename, JSON.stringify(newdata, null, '\t'), function (err) {
		if (err) {
			console.log('error saving ' + filename + ' : ' + err);
			res.send('Beim Speichern ist ein Fehler aufgetreten, bitte nochmal versuchen');
		} else {
			console.log(filename + ' saved');
			res.send('OK, gespeichert. Danke sehr! ' + moment().format('DD.MM.YYYY, HH:mm'));
		}
	});
});

function loadData(doc, callback) {
	var filename = path.resolve(__dirname, config.dataPathSource + doc.filename);
	fs.exists(filename, function (exists) {
			if (exists) {
				fs.readFile(filename, function (err, filedata) {
					if (err) {
						console.log('error loading "' + filename + '"');
						callback(false);
					} else {
						console.log(filename + ' loaded');
						doc.data = JSON.parse(filedata);
						callback(true);
					}
				});
			} else {
				console.log('"' + filename + '" could not be loaded, please check config.js for the right paths');
				callback(false);
			}
		}
	);
}

function init(cb) {
	loadData(data.languages, function (success) {
		if (success) {
			loadData(data.directive, function (success) {
				if (success) {
					loadData(data.docs, function (success) {
						if (success) {
							loadData(data.lobbyists, function (success) {
								if (success) {
									data.connectLobbyists();
									data.prepareLobbyistDocs();
									cb();
								}
							});
						}
					});
				}
			});
		}
	});
}

init(function () {
	app.listen(config.port);
	console.log('Server is listening to you on port ' + config.port);
});



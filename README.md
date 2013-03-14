# LobbyPlag Data Enter

A small tool for manual entering data for the [LobbyPlag](http://www.lobbyplag.eu/) project.

Needed Data: `directive.json` and `documents.json`

##Requirements

[http://nodejs.org/](http://nodejs.org/)

modules for node js in path `plagenter/`

	npm install
	
## plagenter/config.js

```` javascript
config = {
	dataPathSource: '../data/',	//path to documents.json & directive.json
	dataPathDest: '../newdata/',	//path where to save the result fragment json files
	port: 3000			//port for the server
};
````

## plagenter/app.js

run with node and enter data with the browser


## result data

proposal json fragments will be saved to the path set in `config.dataPathDest` with an id as filename

e.g. b43f14c7005de400547b83f079130c0442432713.json

format is equal to `proposals.json` 

```` javascript
{
	"doc": "some-draft-opinion_final.pdf",     // filename of the proposals source
	"doc_uid": "44c03f...",                    // uid of the proposals source
	"page": "3",                               // the proposals page number in the source 
	"relations": ["h1"],                       // which parts of the directive the proposal relates to
	"text": {
		"old": "some old text",                  // the original text of the directive
		"new": "some new text"                   // the proposed text
	},
	"uid": "48894d..."                         // uid of the proposal 
}
````

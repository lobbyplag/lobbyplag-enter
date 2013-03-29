# LobbyPlag Data Enter

A small tool for manual entering data for the [LobbyPlag](http://www.lobbyplag.eu/) project.

Needed Data: `directive.json`, `documents.json`, `lobbyists.json` and `lang.json`

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


```` javascript
{
	"doc": "some-draft-opinion_final.pdf",     // filename of the proposals source
	"doc_uid": "44c03f...",                    // uid of the proposals source
	"page": "3",                               // the proposals page number in the source 
	"relations": ["h1"],                       // which parts of the directive the proposal relates to
    "relationwhere": "direct",				   // position in the directive the proposal relates to ('direct' | 'after' | 'unknown')
	"text": {
		"old": "some old text",                  // the original text of the directive
		"new": "some new text"                   // the proposed text
	},
	"uid": "48894d...",                         // uid of the proposal
	"comment": false							//if the text of the proposal is a comment (and not a directive change)
}
````

## shortcuts
	ctrl+S
	Save Data

 	ctrl+D
 	Download Directive Part

 	ctrl+L
 	Clear both Textareas

	alt+shift+left
	Clear Left (Directive) Textarea

	alt+shift+right
	Clear Right (Proposal) Textarea

	ctrl+right
	Increase Page Nr

	ctrl+left
	Decrease Page Nr

	ctrl+down
	Select Next Directive Part

	ctrl+up
    Select Previous Directive Part

	ctrl+alt+up
	Select 10th. next Directive Part

	ctrl+alt+up
	Select 10th. previous Directive Part

	alt+1
	Focus Document Combobox

	alt+2
	Focus Page Nr Input

	alt+3
	Focus Directive Combobox

	alt+4
	Focus Directive Position Combobox

	alt+5
	Focus Proposal Type Combobox

	alt+6
	Focus Textarea Directive

	alt+7
	Focus Textarea Proposal
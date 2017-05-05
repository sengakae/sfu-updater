var fs = require('fs');
var prompt = require('prompt');
var Q = require('q');

var models = require('./models');

function promptForJSON(requestMessage) {
    var deferred = Q.defer();
    fileSchema = {
	properties: {
	    file: {
		description: 'Filename',
		required: true
	    }
	}
    };
    console.log(requestMessage);
    prompt.get(fileSchema, function(err, res) {
	if(err)
	    deferred.reject(err);
	else
	    deferred.resolve(res.file);
    });
    return deferred.promise;
}

function writeDB(file) {
    var deferred = Q.defer();

    fs.readFile('./' + file, function(err, bookdata) {
	models.sequelize.sync({force: true}).then(function() {
	    var data = JSON.parse(bookdata);
	    
	    for(var i = 0; i < data.length; ++i) {
		models.Textbooks.create({
		    dept: data[i].dept,
		    number: data[i].number,
		    section: data[i].section,
		    title: data[i].title,
		    year: data[i].year,
		    term: data[i].term,
		    isbn: data[i].isbn
		});
	    }
	    deferred.resolve();
	});
    });
    
    return deferred.promise;
}

promptForJSON('What is the JSON file you wish to write to the MySQL server?')
    .then(function(file) {
	console.log('Using - ' + file);
	return writeDB(file);
    });

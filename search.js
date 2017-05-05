var prompt = require('prompt');
var Q = require('q');

prompt.start();

module.exports = {
    promptForJSON: function(requestMessage) {
	var deferred = Q.defer();
	jsonSchema = {
	    properties: {
		json: {
		    description: 'JSON File',
		    required: true
		}
	    }
	};
	console.log(requestMessage);
	prompt.get(jsonSchema, function(err, res) {
	    if(err)
		deferred.reject(err)
	    else
		deferred.resolve(res.json);
	});
	return deferred.promise;
    },
    promptForYear: function(requestMessage) {
	var deferred = Q.defer();
	yearSchema = {
	    properties: {
		year: {
		    description: 'Year',
		    required: true
		}
	    }
	};
	console.log(requestMessage);
	prompt.get(yearSchema, function(err, res) {
	    if(err) 
		deferred.reject(err);
	    else 
		deferred.resolve(res.year);
	});
	return deferred.promise;
    },
    promptForTerm: function(requestMessage) {
	var deferred = Q.defer();
	termSchema = {
	    properties: {
		term: {
		    description: 'Term',
		    required: true
		}
	    }
	};
	console.log(requestMessage);
	var terms = ['spring', 'summer', 'fall'];
	var termExpr = '^(';
	terms.forEach(function(term) {
	    console.log('\t' + term);
	    termExpr += term + '|';
	});
	termExpr += ')$';
	termSchema.properties.term.pattern = new RegExp(termExpr);

	prompt.get(termSchema, function(err, res) {
	    if(err)
		deferred.reject(err);
	    else
		deferred.resolve([res.term]);
	});
	return deferred.promise;
    }
}

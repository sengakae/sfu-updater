var http = require('http');
var https = require('https');
var Q = require('q');

http.globalAgent.maxSockets = 3;

function getISBN(book) {
    var deferred = Q.defer();
    var options = {
	hostname: 'www.googleapis.com',
	path: '/books/v1/volumes?q=isbn:' + book.isbn,
	port: 443,
	method: 'GET',
	headers: {
	    'Accept': 'application/json'
	}
    }

    var request = https.request(options, function(res) {
	var resBody = '';
	res.on('data', function appendData(responseChunk) {
	    resBody += responseChunk;
	});
	res.on('end', function useBody() {
	    try {
		var parsed = JSON.parse(resBody);
		parsed.info = book;
		deferred.resolve(parsed);
	    }
	    catch(error) {
		deferred.reject(new Error(resBody));
	    }
	});
    });
    request.end();
    request.on('error', function(errorData) {
	deferred.reject(new Error('Error making call - \n' + errorData));
    });

    return deferred.promise;
}

function getCall(path, course, number) {
    var deferred = Q.defer();
    var options = {
	hostname: 'www.sfu.ca',
	path: '/bin/wcm/course-outlines?' + path,
	port: 80,
	headers: {
	    'Accept': 'application/json'
	}
    };

    // debug 
    //console.log('Calling - ' + options.hostname + options.path);

    var request = http.request(options, function(res) {
	var resBody = '';
	res.on('data', function appendData(responseChunk) {
	    resBody += responseChunk;
	});
	res.on('end', function useBody() {
	    try {
		var parsed = JSON.parse(resBody);
		if(course)
		    parsed.course = course;
		if(number) 
		    parsed.number = number;
		deferred.resolve(parsed);
	    }
	    catch(error) {
		deferred.reject(new Error(resBody));
	    }
	});
    });
    request.end();
    request.on('error', function(errorData) {
	deferred.reject(new Error('Error making call - \n' + errorData));
    });

    return deferred.promise;
}

module.exports = {
    get: getCall,
    getISBN: getISBN
}

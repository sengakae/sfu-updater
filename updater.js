var Q = require('q');
var fs = require('fs');

var api = require('./api');
var models = require('./models');

var _this = this;
_this = {
    Year: '',
    Term: ''
}

// Lists of lists
var Courses = {};
var CourseList = [];
var CoursesDB = [];
var BookList = [];
var BookDB = [];

function getYear() {
    return _this.Year;
}

function getTerm() {
    return _this.Term[0];
}

function buildCourses() {
    var deferred = Q.defer();
    var path = getYear() + '/' + getTerm();

    api.get(path)
	.then(function(results) {
	    results.forEach(function(result) {
		CourseList.push(result.value);
	    });
	    deferred.resolve();
	})
	.catch(function(error) {
	    deferred.reject(error);
	});
    return deferred.promise;
};

function getCourseNumbers() {
    var deferred = Q.defer();
    var promises = [];

    for(var i in CourseList) {
	var path = getYear() + '/' + getTerm() + '/' + CourseList[i];
	
	promises.push(api.get(path, CourseList[i]));
    }

    Q.allSettled(promises)
	.then(function(results) {
	    results.forEach(function(result) {
		var courseObj = {};
		if(!result.value.errorMessage) {
		    result.value.forEach(function(number) {
			courseObj[number.value] = [];
		    });
		    Courses[result.value.course] = courseObj;
		}
	    });
	    deferred.resolve();
	})
	.catch(function(err) {
	    console.log(new Error('Course Number API Error - \n ' + err));
	    deferred.reject();
	});

    return deferred.promise;
};

function cleanCourses() {
    for(var course in Courses) {
	if(Courses[course].length === 0) {
	    delete Courses[course];
	}
    }
};

function getCourseSections() {
    var deferred = Q.defer();
    var promises = [];

    for(var course in Courses) {
	for(var num in Courses[course]) {
	    var path = getYear() + '/' + getTerm() + '/' + course + '/' + num;
	    promises.push(api.get(path, course, num));
	}
    }

    Q.allSettled(promises) 
	.then(function(results) {
	    results.forEach(function(result) {
		var course = result.value.course;
		var number = result.value.number;
		var sectionObj = {};
		for(var i = 0; i < result.value.length; ++i) {
		    sectionObj[result.value[i].value] = '';
		}
		Courses[course][number] = sectionObj;
	    });
	    deferred.resolve();
	})
	.catch(function(err) {
	    console.log(new Error(err));
	    deferred.reject();
	});

    return deferred.promise;
};

function getTextbooks() {
    var deferred = Q.defer();
    var promises = [];
    
    for(var course in Courses) {
	for(var num in Courses[course]) {
	    for(var section in Courses[course][num]) {
		var path = getYear() + '/' + getTerm() + '/' + course + '/' + num + '/' + section;

		promises.push(api.get(path));
	    }
	}
    }

    Q.allSettled(promises)
	.then(function(results) {
	    results.forEach(function(result) {
		if(!result.value.errorMessage) {
		    if(result.value.requiredText) {
                var book_title = null;
                for(var i in result.value.requiredText) {
                    var isbn_string = null;
                    if(result.value.requiredText[i].isbn) {
                        isbn_string = (result.value.requiredText[i].isbn).replace(/\D+/g, '');
                        if(result.value.requiredText[i].details) 
                            // a ton of filtering with regex to build a satisfactory book title
                            book_title = (result.value.requiredText[i].details)
                                .replace(/(<([^>]+)>)/ig, '')
                                .replace(/&nbsp;/g, '')
                                .replace(/\r\n/g, '')
                                .replace(/Required Textbook: /g, '')
                                .replace(/Course Textbook: /g, '')
                                .replace(/LECTURE TEXTBOOK: /g, '')
                                .replace(/LABORATORY TEXTBOOK: /g, '')

                        var temp = {
                            'dept': result.value.info.dept,
                            'number': result.value.info.number,
                            'section': result.value.info.section,
                            'title': result.value.info.title,
                            'bookTitle': null,
                            'year':  getYear(),
                            'term': getTerm(),
                            'isbn': isbn_string
                        };
                        if(book_title)
                            temp.bookTitle = book_title;
                            
                        CoursesDB.push(temp);
                    }
                }
		    }
		}
	    });
	    deferred.resolve();
	})
	.catch(function(err) {
	    console.log(new Error('Textbook API Error - \n' + err));
	    deferred.reject();
	});

    return deferred.promise;
};

function writeJSONtoFile() {
    var deferred = Q.defer();

    fs.writeFile('./' + getYear() + getTerm() + '.json', JSON.stringify(CoursesDB, null, 4), function(err) {
	if(err) 
	    deferred.reject(err);
	deferred.resolve();
    });

    return deferred.promise;
};

function writeBooksToJSON(filename) {
    var deferred = Q.defer();
    
    fs.writeFile('./' + filename + 'books.json', JSON.stringify(BookDB, null, 4), function(err) {
	if(err)
	    deferred.reject(err);
	deferred.resolve();
    });

    return deferred.promise;
};

function readCourses(filename) {
    var deferred = Q.defer();
    
    fs.readFile('./' + filename, function(err, bookdata) {
	var data = JSON.parse(bookdata);

	for(var i = 0; i < data.length; ++i) {
	    BookList.push({
            'dept': data[i].dept,
            'number': data[i].number,
            'section': data[i].section,
            'bookTitle': data[i].bookTitle,
            'year': data[i].year,
            'term': data[i].term,
            'isbn': data[i].isbn
	    });
	}
	deferred.resolve(filename);
    });

    return deferred.promise;
};

function parseTextbooks(filename) {
    var deferred = Q.defer();
    var promises = [];

    for(var i = BookList.length/4 | 0; i < BookList.length/2 | 0; ++i) {
        //for(var i = 0; i < 2; ++i) {
        if(BookList[i].bookTitle)
            promises.push(api.getISBN(BookList[i]));
    }
    //promises.push(api.getISBN(BookList[0]));
	
	var count = BookDB.length;

    Q.allSettled(promises)
	.then(function(results) {
	    results.forEach(function(result) {
            if(result.state === 'rejected') 
                deferred.reject(new Error('Error calling api - \n' + result.reason));
            console.log(result);
            var temp = {
                'dept': result.value.info.dept,
                'number': result.value.info.number,
                'section': result.value.info.section,
                'title': result.value.info.bookTitle,
                'author': '',
                'year': result.value.info.year,
                'term': result.value.info.term,
                'isbn': result.value.info.isbn,
                'thumbnail': null
            };
            if(result.value.items) {
                temp.title = result.value.items[0].volumeInfo.title;
                temp.author = result.value.items[0].volumeInfo.authors.join(', ');
                try {
                    temp.thumbnail = result.value.items[0].volumeInfo.imageLinks.smallThumbnail;
                }
                catch(e) {
                    temp.thumbnail = null;
                }
            }
            BookDB.push(temp);	
            });
	    deferred.resolve(filename);
	})
	.catch(function(err) {
	    console.log(new Error('Google ISBN API Error - \n' + err));
	    deferred.reject();
	});

    return deferred.promise;
};

module.exports = {
    setYear: function(year) {
	_this.Year = year;
    },
    setTerm: function(term) {
	_this.Term = term;
    },
    buildCourses: buildCourses,
    getCourseNumbers: getCourseNumbers,
    getCourseSections: getCourseSections,
    cleanCourses: cleanCourses,
    getTextbooks: getTextbooks,
    writeJSONtoFile: writeJSONtoFile,
    readCourses: readCourses,
    parseTextbooks: parseTextbooks,
    writeBooksToJSON: writeBooksToJSON
};

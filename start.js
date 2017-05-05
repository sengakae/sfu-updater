// q promise library
var Q = require('q');

var api = require('./api');
var updater = require('./updater');
var search = require('./search');

console.log('\n~~~~~~~~ Welcome to the SFU Textbook DB Updater! ~~~~~~~~');
search.promptForYear('What is the year you wish to access?')
    .then(function(year) {
	updater.setYear(year);
	return search.promptForTerm('What is the term you wish to access?');
    })
    .then(function(term) {
	updater.setTerm(term);
	console.log('Retreiving Courses');
	return updater.buildCourses();
    })
    .then(function() {
	console.log('Retreiving Course Numbers');
	return updater.getCourseNumbers();
    })
    .then(function() {
	console.log('Retreiving Course Sections');
	updater.cleanCourses();
	return updater.getCourseSections();
    })
    .then(function(){ 
	console.log('Retreiving Course Textbooks');
	return updater.getTextbooks();
    })
    .then(function() {
	console.log('Writing Course List to JSON File');
	return updater.writeJSONtoFile();
    })
    .done(function() {
	console.log('\n~~~~~~~~ Thank You For Using The SFU Textbook DB Updater! ~~~~~~~~');
	process.exit(0);
    });

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('test1', 'meh', 'cmpt470meh', {
    host: 'sfu-course-textbooks.cpbpng0dlcg2.us-west-1.rds.amazonaws.com',
    port: 3306,
    dialect: 'mysql',
    define: {
        charset: 'utf8'
    }
});

var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
	return (file.indexOf(',') !== 0) && (file !== 'index.js');
    })
    .forEach(function(file) {
	var model = sequelize.import(path.join(__dirname, file));
	db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if('associate' in db[modelName]) {
	db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

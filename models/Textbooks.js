"use strict";

module.exports = function(sequelize, DataType) {
    var Textbooks = sequelize.define('Textbooks', {
	dept: {
	    type: DataType.STRING,
	    field: 'dept'
	},
	number: {
	    type: DataType.STRING,
	    field: 'number'
	},
	section: {
	    type: DataType.STRING,
	    field: 'section'
	},
	title: {
	    type: DataType.STRING,
	    field: 'title'
	},
	author: {
	    type: DataType.STRING,
	    field: 'author'
	},
	publisher: {
	    type: DataType.STRING,
	    field: 'publisher'
	},
	year: {
	    type: DataType.INTEGER,
	    field: 'year'
	},
	term: {
	    type: DataType.STRING,
	    field: 'term'
	},
	isbn: {
	    type: DataType.STRING,
	    field: 'isbn'
	},
	thumbnail: {
	    type: DataType.STRING,
	    field: 'thumbnail'
	},
    }, {
	tableName: 'sfu_textbook_trade_app_textbook'
    });

    return Textbooks;
};

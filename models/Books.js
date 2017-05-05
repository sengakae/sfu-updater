"use strict";

module.exports = function(sequelize, DataType) {
    var Books = sequelize.define('Books', {
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
	publishedDate: {
	    type: DataType.STRING,
	    field: 'publishedDate'
	},
	thumbnail_s: {
	    type: DataType.STRING,
	    field: 'thumbnail_s'
	},
	thumbnail: {
	    type: DataType.STRING,
	    field: 'thumbnail'
	},
    });

    return Books;
};

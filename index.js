/*
 *	Filename:		index.js
 *	Author:			Grant Spencer
 *	Date:			1/22/2017
 *	Description:	Exports the mongoose markdown description middleware
 *	NOTE:			A large amount of this code is reused from the NPM
 *					package mongoose-slugs, which is MIT licensed.
 *					Thank you to the author, yunghwakwon.
 */

var mongoose = require('mongoose');
var extend = require("node.extend");
var removeMd = require('remove-markdown')
var _ = require('lodash')

/*
 * Markdown description generator
 *
 * @param {String} modelName
 * @param {String|Array} sluggable
 * @param {String} dest
 * @param {Object} opts
 * @return {Function}
 */

module.exports = function(modelName, markdownField, destField, opts) {
	opts = opts || {};

	return function generateSlug(next, done) {
		var destModified = isModifield.call(this, destField);

		// If the field hasn't been changed, don't do anything
		if (!isModifield.call(this, markdownField) && !destModified) {
			return next();
		}

		var string;
		if (destModified) {
			string = this[destField]; // "slug" has been manually defined
		} else {
			string = getTheMarkdown.call(this, markdownField);
		}

		this[destField] = _.truncate(removeMd(string), {length: 140});
	};
};

/*
 * isModifield returns boolean based on whether the field(s) have been modified
 *
 * @param {String|Array} fieldName
 * @return {Boolean}
 */

function isModifield(fieldName) {
	// recurse for an array of fields
	if (fieldName instanceof Array) {
		var self = this;
		var i = 0;
		var len = fieldName.length;
		for(; i<len; i++) {
			if (isModifield.call(self, fieldName[i])) {
				return true;
			}
		}
		return false;
	}

	return ~this.modifiedPaths().indexOf(fieldName);
}

/*
 * getTheMarkdown returns the markdown to be modified
 *
 * @param {String|Array} fieldName
 * @return {String}
 */

function getTheMarkdown(fieldName) {
	if ("string" === typeof fieldName) {
		fieldName = [fieldName];
	}
	var self = this;
	return fieldName.map(function(f) {
		return self[f];
	}).join(" ").trim();
}
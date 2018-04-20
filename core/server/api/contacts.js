// # Contact API
// RESTful API for the Contact resource
// var Promise = require('bluebird'),
var _ = require('lodash'),
    pipeline = require('../lib/promise/pipeline'),
    localUtils = require('./utils'),
    models = require('../models'),
    // common = require('../lib/common'),
    docName = 'contacts',
    allowedIncludes = ['count.posts'],
    contacts;

/**
 * ### Contacts API Methods
 *
 * **See:** [API Methods](constants.js.html#api%20methods)
 */
contacts = {
    /**
     * ## Browse
     * @param {{context}} options
     * @returns {Promise<Contacts>} Contacts Collection
     */
    browse: function browse(options) {
        var tasks;

        /**
         * ### Model Query
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return models.Contact.findPage(options);
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            localUtils.validate(docName, {
                opts: localUtils.browseDefaultOptions
            }),
            localUtils.convertOptions(allowedIncludes),
            localUtils.handlePublicPermissions(docName, 'browse'),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options);
    },

    /**
     * ## Add
     * @param {Tag} object the tag to create
     * @returns {Promise(Tag)} Newly created Tag
     */
    add: function add(object, options) {
        var tasks;
        /**
         * ### Model Query
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return models.Contact.add(
                object.contacts[0],
                _.omit(options, ['data'])
            ).then(function onModelResponse(model) {
                return {
                    contacts: [model.toJSON(options)]
                };
            });
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            localUtils.validate(docName),
            localUtils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, object, options);
    }
};

module.exports = contacts;

'use strict';

const ghostBookshelf = require('./base');
let Contact, Contacts;

Contact = ghostBookshelf.Model.extend({

    tableName: 'contacts',

    defaults: function defaults() {
        return {
            visibility: 'public'
        };
    },

    emitChange: function emitChange(event, options) {
        const eventToTrigger = 'contacts' + '.' + event;
        ghostBookshelf.Model.prototype.emitChange.bind(this)(this, eventToTrigger, options);
    },

    onCreated: function onCreated(model, attrs, options) {
        model.emitChange('added', options);
    },

    contacts: function posts() {
        return this.belongsToMany('Contact');
    },

    toJSON: function toJSON(unfilteredOptions) {
        var options = Contact.filterOptions(unfilteredOptions, 'toJSON'),
            attrs = ghostBookshelf.Model.prototype.toJSON.call(this, options);

        attrs.parent = attrs.parent || attrs.parent_id;
        delete attrs.parent_id;

        return attrs;
    }
}, {
    orderDefaultOptions: function orderDefaultOptions() {
        return {
            created_at: 'DESC',
            id: 'DESC'
        };
    },

    /**
     * @deprecated in favour of filter
     */
    processOptions: function processOptions(options) {
        return options;
    },

    permittedOptions: function permittedOptions(methodName) {
        var options = ghostBookshelf.Model.permittedOptions(),

            // whitelists for the `options` hash argument on methods, by method name.
            // these are the only options that can be passed to Bookshelf / Knex.
            validOptions = {
                findPage: ['page', 'limit', 'columns', 'filter', 'order'],
                findAll: ['columns'],
                findOne: ['visibility']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    }
});

Contacts = ghostBookshelf.Collection.extend({
    model: Contact
});

module.exports = {
    Contact: ghostBookshelf.model('Contact', Contact),
    Contacts: ghostBookshelf.collection('Contacts', Contacts)
};

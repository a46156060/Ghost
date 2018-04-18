var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs-extra'),
    config = require('../config'),
    models = require('../models'),
    pUnlink = Promise.promisify(fs.unlink),
    storage = require('../adapters/storage'),
    files;

/**
 * ## Upload API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
files = {
    /**
     * ### Add Image
     *
     * @public
     * @param {{context}} options
     * @returns {Promise<String>} location of uploaded file
     */
    add: Promise.method(function (options) {
        const store = storage.getStorage();

        const targetDir = config.getContentPath('files');

        return store.save(options, targetDir).finally(function () {
            // Remove uploaded file from tmp location
            return pUnlink(options.path);
        });
    }),
    download(req, res) {
        const {id} = req.params;

        return models.Post.findOne({id}).then((model) => {
            const filePath = path.join(
                config.getContentPath('files'),
                model.attributes.file
            );
            return res.download(filePath);
        });
    },
    destroy(req, res) {
        const id = req.params.id;

        if (!id) {
            return;
        }

        const store = storage.getStorage();
        const targetDir = config.getContentPath('files');

        models.Post.findOne({id}).then((model) => {
            if (!model) {
                res.status = 400;
                return res.end('FILE NOT FOUND');
            }
            const post = model.attributes;

            try {
                store.delete(`${targetDir}${post.file}`);
                models.Post.edit({file: null}, {id});

                res.status = 200;
                return res.end();
            } catch (err) {
                res.status = 400;
                return res.end(err);
            }
        });
    }
};

module.exports = files;

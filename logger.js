var log4js = require('log4js');

module.exports.logger = function (name) {
    log4js.configure('log4js_configuration.json', {});
    return log4js.getLogger(name || 'pro');
};
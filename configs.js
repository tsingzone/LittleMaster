/**
 * Created by William on 15/10/20.
 */
var fs = require('fs');

function loadJsonFromFile(file, ignore_nofile) {
    if (fs.existsSync(file)) {
        var str = fs.readFileSync(file, { encoding: "utf8" , flag: "r" });
        return JSON.parse(str);
    } else if (!ignore_nofile) {
        throw { "name": "InvalidArgument", "message": "File not found: " + file };
    }
    return {};
}

function loadConfig(configKey) {
    if (!configKey) {
        throw { "name": "InvalidArgument", "message": "Must provide a config key!" };
    }
    var baseConfig = loadJsonFromFile("configs/config.json");
    var extraConfig = loadJsonFromFile("configs/config-" + configKey + ".json");
    var config = extend(true, baseConfig, extraConfig);

    console.log("config:" + JSON.stringify(config));
    return config;
}

var config = loadConfig('local');

var Configs = {
    init: function() {

    },
    getConfig: function() {
        return config;
    }
}

modules.exports = Configs;
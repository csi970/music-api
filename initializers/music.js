exports.music = function(api, next) {
    
    api.music = require('music-analysis');

    next();
};

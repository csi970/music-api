exports.musescore_api = function(api, next) {
    
    api.musescore = {};
    api.musescore.base = 'http://api.musescore.com/services/rest';
    api.musescore.resolve = api.musescore.base + '/resolve.json';
    api.musescore.static = 'http://static.musescore.com';
    
    next();
};

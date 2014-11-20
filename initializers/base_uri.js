exports.base_uri = function(api, next) {
    
    api.base_uri = 'https://music-api.herokuapp.com/api/';

    next();
};

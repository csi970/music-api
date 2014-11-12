exports.base_uri = function(api, next) {
    
    api.base_uri = 'http://zeus.benburwell.com:8080/api/';

    next();
};

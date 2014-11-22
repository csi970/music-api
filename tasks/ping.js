exports.task = {
    name: 'ping',
    description: 'Pings the API',
    queue: 'default',
    frequency: 1000 * 60 * 45,
    run: function(api, params, next) {
        var request = require('request');
        request('https://music-api.herokuapp.com/', function() {
            console.log('Pinged the API');
        });
        next();
    }
};

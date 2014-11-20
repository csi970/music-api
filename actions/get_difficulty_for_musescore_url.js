var request = require('request');
var action = {};

action.name = 'get_difficulty_for_musescore_url';
action.version = 1;
action.description = 'Get the stats and difficulty for a public MuseScore.com url';
action.inputs = {
    'required': [
        'url'
    ],
    'optional': []
};
action.blockedConnectionTypes = [];
action.outputExample = {
    id: 1234,
    vid: 1234,
    secret: 'abc123',
    uri: 'http://example.com',
    permalink: 'http://example.com',
    title: 'Music',
    description: 'A song',
    stats: {
        measures: 1,
        rests: 2,
        chords: 3,
        notes: 4,
        accidentals: 5,
        graceNotes: 6,
        keyChanges: 7,
        timeChanges: 8,
        totalSound: 9,
        totalRest: 10,
        range: 11
    },
    difficulty: 0
};

action.run = function(api, connection, next) {
    // 1. resolve url to API location
    //    - check database for `permalink` matching `url`
    //    - if we don't have it cached, use the `resolve` method
    var options = {
        method: 'GET',
        url: api.musescore.resolve,
        qs: {
            'oauth_consumer_key': process.env.MUSESCORE_CONSUMER_KEY,
            'url': decodeURIComponent(connection.params.url)
        },
        followRedirect: true
    };

    request(options, function(err, response, body) {

        connection.response.options = options;
        connection.response.err = err;
        connection.response.response = response;
        connection.response.body = body;

        next(connection, true);
        // if (err) {
        //     connection.response.error = err;
        //     next(connection, true);
        // } else {
        //     var info = JSON.parse(body);
        //     connection.response.info = info;
        //     next(connection, true);
        // }
    });

    // 2. check whether we have a fresh copy in our database by pinging
    //    the MuseScore API and comparing the `vid`s
    //    - if we do, respond & return that

    // 3. use the npm package to compute stats. save to database and
    //    respond

    // next(connection, true);
};

exports.action = action;

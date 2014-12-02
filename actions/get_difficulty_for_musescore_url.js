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
    parts: [{
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
    }]
};

action.run = function(api, connection, next) {
    // 1. resolve url to API location
    //    - check database for `permalink` matching `url`
    //    - if we don't have it cached, use the `resolve` method
    request({
        method: 'GET',
        url: api.musescore.resolve,
        qs: {
            'oauth_consumer_key': process.env.MUSESCORE_CONSUMER_KEY,
            'url': decodeURIComponent(connection.params.url)
        },
        followRedirect: true
    }, function(err, response, body) {

        if (err) {
            next(connection, true);
        } else {
            var info = JSON.parse(body);

            // 2. Check whether we have a fresh copy in our database by comparing the `vid`s
            api.db.Score.findOne({
                id: info.id,
                vid: info.vid
            }, function(err, doc) {

                // see if there was an error
                if (err) {
                    connection.response.error = err;
                    next(connection, true);
                } else {

                    // see if we have it in the database
                    if (doc) {
                        // we do, so we'll just return that
                        connection.response = doc.toObject();
                        next(connection, true);
                    } else {
                        // we need to grab the MusicXML file and process it

                        request({
                            method: 'GET',
                            url: api.musescore.static + '/' + info.id + '/' + info.secret + '/score.mxl'
                        }, function(err, response, body) {

                            if (err) {
                                connection.response.error = err;
                                next(connection, true);
                            } else {
                                require('music-analysis').parseMXL(body, function(score) {
                                    var score_for_db = {
                                        id: info.id,
                                        vid: info.vid,
                                        secret: info.secret,
                                        uri: info.uri,
                                        permalink: info.permalink,
                                        title: info.title,
                                        description: info.description
                                    };

                                    score_for_db.parts = score.parts.map(function(p) {
                                        return p.getRawStats();
                                    });

                                    new api.db.Score(score_for_db).save(function(err, doc) {
                                        if (err) {
                                            connection.response.error = err;
                                            next(connection, true);
                                        } else {
                                            connection.response = doc.toObject();
                                            connection.response._fresh = true;
                                            next(connection, true);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};

exports.action = action;

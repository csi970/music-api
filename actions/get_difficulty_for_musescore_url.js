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
    lastModified: 1417629854,
    parts: [{
        numMeasures: 1,
        numRests: 2,
        numChords: 3,
        numNotes: 4,
        numAccidentals: 5,
        numGraceNotes: 6,
        keyChanges: 7,
        timeChanges: 8,
        totalSound: 9,
        totalRest: 10,
        range: {
            minPitch: "C3",
            maxPitch: "C7"
        }
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

                        var url = api.musescore.static + '/' + info.id + '/' + info.secret + '/score.mxl';

                        request({
                            method: 'GET',
                            encoding: 'binary',
                            url: api.musescore.static + '/' + info.id + '/' + info.secret + '/score.mxl'
                        }, function(err, response, body) {
                            if (err) {
                                connection.response.error = err;
                                next(connection, true);
                            } else {
                                api.music.parseMXL(body, function(score) {
                                    var score_for_db = {
                                        id: info.id,
                                        vid: info.vid,
                                        secret: info.secret,
                                        uri: info.uri,
                                        permalink: info.permalink,
                                        title: info.title,
                                        description: info.description,
                                        lastModified: info.dates.lastupdate
                                    };

                                    score_for_db.parts = score.parts.map(function(p) {
                                        var s = p.getRawStats();
                                        s.difficulty = p.getDifficulty();
                                        return s;
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

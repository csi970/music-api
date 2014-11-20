var action = {
    name: 'get_difficulty_for_musescore_url',
    description: 'Get the stats and difficulty for a public MuseScore.com url',
    inputs: {
        required: [
            'url'
        ],
        optional: []
    },
    blockedConnectionTypes: [],
    outputExample: api.db.scoreObject,
    run: function(api, connection, next) {
        // 1. resolve url to API location
        //    - check database for `permalink` matching `url`
        //    - if we don't have it cached, use the `resolve` method
        request({
            method: 'GET',
            url: api.musescore.resolve,
            qs: {
                'oauth_consumer_key': process.env.MUSESCORE_CONSUMER_KEY,
                'url': connection.params.url
            },
            followRedirect: true
        }, function(err, response, body) {

            if (err) {
                connection.response.error = err;
                next(connection, true);
            } else {
                var info = JSON.parse(body);
                connection.response.info = info;
                next(connection, true);
            }
        });

        // 2. check whether we have a fresh copy in our database by pinging
        //    the MuseScore API and comparing the `vid`s
        //    - if we do, respond & return that

        // 3. use the npm package to compute stats. save to database and
        //    respond

        next(connection, true);
    }
};

exports.action = action;

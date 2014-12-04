exports.mongoose = function(api, next) {
    var mongoose = require('mongoose');

    var scoreObject = {
        id: Number,
        vid: Number,
        secret: String,
        uri: String,
        permalink: String,
        title: String,
        description: String,
        lastModified: Number,
        parts: [{
            difficulty: Number,
            numMeasures: Number,
            numRests: Number,
            numChords: Number,
            numNotes: Number,
            numAccidentals: Number,
            numGraceNotes: Number,
            keyChanges: Number,
            keyUsage: Array,
            timeChanges: Number,
            timeSigUsage: Array,
            totalSound: Number,
            totalRest: Number,
            range: {
                minPitch: String,
                maxPitch: String
            }
        }]
    };

    var scoreSchema = new mongoose.Schema(scoreObject);

    if (!scoreSchema.options.toObject) {
        scoreSchema.options.toObject = {};
    }

    scoreSchema.options.toObject.transform = function(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        delete ret.secret;
    };

    var Score = mongoose.model('Score', scoreSchema);

    var uri = process.env.MONGOLAB_URI || 'mongodb://localhost/music';
    mongoose.connect(uri);

    api.db = {
        mongoose: mongoose,
        scoreObject: scoreObject,
        Score: Score
    };

    next();
};

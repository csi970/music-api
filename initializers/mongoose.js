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
        parts: [{
            measures: Number,
            rests: Number,
            chords: Number,
            notes: Number,
            accidentals: Number,
            graceNotes: Number,
            keyChanges: Number,
            timeChanges: Number,
            totalSound: Number,
            totalRest: Number,
            range: Number
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

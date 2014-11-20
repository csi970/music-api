exports.mongoose = function(api, next) {
    var mongoose = require('mongoose');

    var scoreSchema = new mongoose.Schema({
        parts: [{
            id: String,
            name: String,
            instrument: String,
            measures: [{
                chords: [{
                    notes: [{
                        pitch: {
                            stepLetter: String,
                            step: String,
                            octave: Number,
                            value: Number
                        },
                        cue: Boolean,
                        rest: Boolean,
                        grace: Boolean,
                        voice: Boolean,
                        duration: Number,
                        noteType: String
                    }]
                }],
                divisions: Number,
                keySignature: String,
                timeSignature: String,
                stats: [{
                    accidentals: Number,
                    graceNotes: Number,
                    rests: Number,
                    chords: Number,
                    notes: Number,
                    noteLength: Number,
                    restLength: Number,
                    range: {
                        minPitch: {
                            step: String,
                            octave: Number
                        },
                        maxPitch: {
                            step: String,
                            octave: Number
                        }
                    }
                }]
            }]
        }]
    });

    if (!scoreSchema.options.toObject) {
        scoreSchema.options.toObject = {};
    }

    scoreSchema.options.toObject.transform = function(doc, ret, options) {
        // ret.uri = api.base_uri + 'scores/' + ret._id;
        delete ret._id;
        delete ret.__v;
    };

    var Score = mongoose.model('Score', scoreSchema);

    var uri = 'mongodb://localhost/music';
    mongoose.connect(uri);

    api.db = {
        mongoose: mongoose,
        Score: Score
    };

    next();
};

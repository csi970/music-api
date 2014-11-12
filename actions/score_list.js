var action = {};

action.name = 'score_list';
action.description = 'Retrieve a list of scores';
action.inputs = {
    'required' : [],
    'optional' : []
};
action.blockedConnectionTypes = [];
action.outputExample = {
    scores: 'HELELAOASD'
}

/////////////////////////////////////////////////////////////////////
// functional
action.run = function(api, connection, next) {
    api.db.Score.find(function (err, scores) {
        if (err) {
            connection.response.error = err;
        } else {
            connection.response.scores = scores.map(function(score) {
                return score.toObject();
            });
        }

        next(connection, true);
    });
};

/////////////////////////////////////////////////////////////////////
// exports
exports.action = action;

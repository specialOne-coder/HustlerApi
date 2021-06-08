const mongoose = require('mongoose');

// schema du document representant une alerte
const alerteSchema = mongoose.Schema({

    alerteurId: {
        type: String,
        required: true,
    },
    titre: {
        type: String,
        trim: true,
        required: true,
    },
    message: {
        type: String,
        trim: true,
        required: true,
        maxLength: 500
    },
    service: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
    },
    position: {
        type: String,
    },
    status: {
        type: String,
    },
    video: {
        type: String,
    },
},
    {
        timestamp: true,
    }
);

module.exports = mongoose.model('alerte',alerteSchema);
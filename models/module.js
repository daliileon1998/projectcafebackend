const mongoose = require('../db/conectionDB');

const moduloSquema = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    course: {
        id: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        }
    },
    image: {
        type: String,
        required: true
    },
    lessons: {
        type: [
            {
                code: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true
                },
                state: {
                    type: String,
                    required: true
                }
            }
        ],
        required: true
    },
    documents: [{
        name: {
            type: String,
            required: true
        },
        route: {
            type: String,
            required: true
        }
    }]
}, {
    collection: "Module",
    versionKey: false
});

module.exports = mongoose.model('Module', moduloSquema);

const mongoose = require('../db/conectionDB');

const usuarioSquema = mongoose.Schema({
    code: {
        type: 'string',
        required: true,
    },
    name: {
        type: 'string',
        unique: true
    },
    description: {
        type: 'string',
        required: true
    },
    state: {
        type: 'string',
        required: true
    },
    course: {
        id: {
            type: 'string',
            required: true,
        },
        code: {
            type: 'string',
            required: true,
        },
        name: {
            type: 'string',
            unique: true
        },
        description: {
            type: 'string',
            required: true
        },
        state: {
            type: 'string',
            required: true
        }
    },
    image: {
        type: 'string',
        required: true
    },
    lessons: {
        type: [
            {
                code: {
                    type: 'string',
                    required: true
                },
                name: {
                    type: 'string',
                    required: true
                },
                content: {
                    type: 'string',
                    required: true
                },
                state: {
                    type: 'string',
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

module.exports = mongoose.model('Module', usuarioSquema);
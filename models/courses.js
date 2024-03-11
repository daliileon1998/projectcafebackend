const mongoose = require('../db/conectionDB');

const usuarioSquema = mongoose.Schema({
        code:{
            type:'string',
            required: true,
        },
        name:{
            type:'string',
            unique: true
        },
        description:{
            type:'string',
            required:true
        },
        state:{
            type:'string',
            required:true
        },
        image:{
            type:'string',
            required:true
        }   
    },{
        collection: "Courses",
        versionKey: false
    }
);

module.exports = mongoose.model('Courses',usuarioSquema);
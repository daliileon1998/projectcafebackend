const mongoose = require('../db/conectionDB');

const usuarioSquema = mongoose.Schema({
        username:{
            type:'string',
            required: true,
            unique: true
        },
        email:{
            type:'string',
            unique: true
        },
        state:{
            type:'string',
            required:true
        },
        phone:{
            type:'string',
            required:true
        },
        password:{
            type:'string',
            required:true
        }   
    },{
        collection: "Users",
        versionKey: false
    }
);

module.exports = mongoose.model('Users',usuarioSquema);
const mongoose = require('mongoose');

let conexion = "mongodb+srv://daliileon98:987654321@cluster0.0mwhb6a.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(conexion)
  .then(event=> console.log("Conectado a mongo"))
  .catch((error)=> console.log(error));

  module.exports = mongoose;
const mongoose = require('mongoose');

let conexion = "mongodb+srv://projectcafe2024:33TRGyvEycdHABuc@cluster0.gbkps2d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(conexion)
  .then(event=> console.log("Conectado a mongo"))
  .catch((error)=> console.log(error));

  module.exports = mongoose;
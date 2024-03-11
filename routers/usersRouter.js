const express = require('express');
const Usuarios = require('../models/users');
const UsuariosRouter = express.Router();

//Listar Usuarios
UsuariosRouter.get("/", (req,res)=>{
    Usuarios.find()
        .then(datos => res.json({Usuarios:datos}))
        .catch(error=>res.json({mensaje:error}))
});

//Obtener Usuario por id
UsuariosRouter.get("/:id", (req,res)=>{
    Usuarios.findById({_id: req.params.id})
        .then(datos=>res.json(datos))
        .catch(error=>res.json({mensaje:error}))
});

//Guardar Usuario
UsuariosRouter.post("/", (req,res)=>{
    console.log(req.body);
    const usuario = new Usuarios(req.body);
    usuario.save()
    .then(data=> {
        console.log(data)
        res.json(data)})
    .catch(error=>res.json({mensaje:error}))
})

//Modificar Usuario
UsuariosRouter.put("/:id", (req,res)=>{
    Usuarios.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then(usuarioModificado => res.json(usuarioModificado))
    .catch(error => res.json({mensaje: error}));
});

//Ajustar estado de curso
UsuariosRouter.patch("/:id/state", (req,res)=>{
    Usuarios.findByIdAndUpdate(req.params.id, {state: req.body.state}, {new: true})
    .then(usuarioModificado => res.json(usuarioModificado))
    .catch(error => res.json({mensaje: error}));
});

//Eliminar Usuario
UsuariosRouter.delete("/:id", (req,res)=>{
    Usuarios.deleteOne({_id: req.params.id})
        .then(datos=> res.json(datos))
        .catch(error=> res.json({mensaje:error}))
});


module.exports = UsuariosRouter;
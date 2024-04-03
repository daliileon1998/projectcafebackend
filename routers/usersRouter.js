const express = require('express');
const bcrypt = require('bcrypt'); // Importa bcrypt para encriptar la contraseña
const crypto = require('crypto');
const Usuarios = require('../models/users');
const jwt = require('jsonwebtoken');
const UsuariosRouter = express.Router();

// Listar Usuarios
UsuariosRouter.get("/", async (req, res) => {
    try {
        // Excluir los campos 'password' y 'password2' de la consulta
        const usuarios = await Usuarios.find().select('-password -password2');
        // Enviar la lista de usuarios sin los campos excluidos
        res.json({ Usuarios: usuarios });
    } catch (error) {
        // Manejar cualquier error
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: error });
    }
});


// Obtener Usuario por id
UsuariosRouter.get("/:id", async (req, res) => {
    try {
        const usuario = await Usuarios.findById({ _id: req.params.id });
        console.log('usuario -------------->', usuario); // Verifica el usuario recuperado
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Devuelve el objeto de usuario con la contraseña sin modificar
        res.json({ ...usuario.toJSON(), password: usuario.password });
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(500).json({ mensaje: error });
    }
});


// Guardar Usuario
UsuariosRouter.post("/", async (req, res) => {
    try {
        // Encripta la contraseña antes de guardar el usuario
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword; // Asigna la contraseña encriptada al usuario

        const usuario = new Usuarios(req.body);
        const data = await usuario.save();
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ mensaje: error });
    }
});

// Modificar Usuario
UsuariosRouter.put("/:id", async (req, res) => {
    try {
        // Verifica si la solicitud contiene una nueva contraseña
        if (req.body.password) {
            // Genera un hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            // Reemplaza la contraseña en texto plano con el hash en la solicitud
            req.body.password = hashedPassword;
        }
        
        // Actualiza el usuario en la base de datos
        const usuarioModificado = await Usuarios.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Envía la respuesta con el usuario modificado
        res.json(usuarioModificado);
    } catch (error) {
        // Maneja cualquier error
        console.error('Error al modificar usuario:', error);
        res.status(500).json({ mensaje: error });
    }
});

// Ajustar estado de curso
UsuariosRouter.patch("/:id/state", (req, res) => {
    Usuarios.findByIdAndUpdate(req.params.id, { state: req.body.state }, { new: true })
        .then(usuarioModificado => res.json(usuarioModificado))
        .catch(error => res.json({ mensaje: error }));
});

// Eliminar Usuario
UsuariosRouter.delete("/:id", (req, res) => {
    Usuarios.deleteOne({ _id: req.params.id })
        .then(datos => res.json(datos))
        .catch(error => res.json({ mensaje: error }))
});

// Ruta para iniciar sesión
UsuariosRouter.post('/login', async (req, res) => {
 
    // Verificar si el usuario existe en la base de datos
    const usuario = await Usuarios.findOne({ email: req.body.email });
    if (!usuario) return res.status(400).json({ mensaje: 'Correo electrónico o contraseña incorrectos.'});
  
    // Verificar la contraseña
    const validPassword = await bcrypt.compare(req.body.password, usuario.password);
    if (!validPassword) return res.status(400).json({ mensaje: 'Correo electrónico o contraseña incorrectos.'});
  

    const claveSecreta = generarClaveSecreta();
    // Generar token JWT
    const token = jwt.sign({ _id: usuario._id }, claveSecreta);
    res.status(200).json({ mensaje: 'Usuario logueado correctamente.', token : token}); // Enviar el token en el encabezado de respuesta
  });


  const generarClaveSecreta = () => {
    return crypto.randomBytes(32).toString('hex');
  };

module.exports = UsuariosRouter;

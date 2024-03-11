const express = require('express');
const multer = require('multer');
const path = require('path');
const Modules = require('../models/module');
const ModulesRouter = express.Router();
const fs = require('fs');

// Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/modules/');
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.code}-${req.body.name}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});


//Listar Modules
ModulesRouter.get("/", (req,res)=>{
    Modules.find()
        .then(datos => res.json({Modules:datos}))
        .catch(error=>res.json({mensaje:error}))
});

//Obtener module por id
ModulesRouter.get("/:id", (req,res)=>{
    Modules.findById({_id: req.params.id})
        .then(datos=>res.json(datos))
        .catch(error=>res.json({mensaje:error}))
});

//Guardar module
const upload = multer({ storage: storage });
ModulesRouter.post("/", upload.single('image'), (req, res) => {
    const module = new Modules({
        ...req.body,
        image: req.file.path
    });

    module.save()
        .then(data => {
            console.log(data);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
            res.json({ mensaje: error });
        });
});

// Modificar module
ModulesRouter.patch("/:id", (req,res)=>{
    const moduleId = req.params.id;
    const updatedModule = req.body;

    Modules.findById(moduleId)
        .then(existingModule => {
            if (!existingModule) {
                return res.status(404).json({ mensaje: 'Módulo no encontrado.' });
            }

            // Verificar si se proporciona una nueva imagen
            if (updatedModule.image) {
                // Eliminar la imagen existente, si existe
                if (existingModule.image && fs.existsSync(existingModule.image)) {
                    fs.unlinkSync(existingModule.image);
                }

                // Guardar la nueva imagen con el nombre actualizado
                const fileName = `${updatedModule.code}-${updatedModule.name}${path.extname(updatedModule.image)}`;
                const imagePath = path.join('uploads/modules/', fileName);
                updatedModule.image = imagePath;
            }

            // Actualizar el módulo
            Modules.findByIdAndUpdate(moduleId, updatedModule, { new: true })
                .then(updatedModule => {
                    res.json(updatedModule);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({ mensaje: 'Error al modificar el módulo.' });
                });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al modificar el módulo.' });
        });
});

//Eliminar module
ModulesRouter.delete("/:id", (req,res)=>{
    Modules.findById(req.params.id)
        .then(module => {
            if (!module) {
                return res.status(404).json({ mensaje: 'Módulo no encontrado.' });
            }

            // Eliminar la imagen existente, si existe
            if (module.image && fs.existsSync(module.image)) {
                fs.unlinkSync(module.image);
            }

            // Eliminar el módulo
            return Modules.deleteOne({_id: req.params.id});
        })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({mensaje: 'Error al eliminar el módulo.'});
        });
});

module.exports = ModulesRouter;
const express = require('express');
const multer = require('multer');
const path = require('path');
const Modules = require('../models/module');
const ModulesRouter = express.Router();
const fs = require('fs');
const { log } = require('console');

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
ModulesRouter.put("/:id", upload.single('image'), async (req, res) => {
    try {
        const moduleExistente = await Modules.findById(req.params.id);

        let updateData = { ...req.body }; // Copiar todos los datos del cuerpo de la solicitud

        // Verificar si se proporciona una nueva imagen
        if (req.file) {
            // Verificar si la imagen existente y la nueva imagen tienen extensiones diferentes
            if (moduleExistente && moduleExistente.image && path.extname(moduleExistente.image) !== path.extname(req.file.originalname)) {
                // Eliminar la imagen existente si tienen extensiones diferentes
                if (fs.existsSync(moduleExistente.image)) {
                    fs.unlinkSync(moduleExistente.image);
                    console.log("La imagen anterior fue eliminada correctamente.");
                }
            }

            // Generar un nuevo nombre de archivo único para la imagen
            const newFileName = `${req.body.code}-${req.body.name}${path.extname(req.file.originalname)}`;
            const newImagePath = path.join('uploads/modules/', newFileName);

            // Actualizar la ruta de la imagen en multer
            req.file.path = newImagePath;

            updateData.image = newImagePath;

            // Imprimir el nombre de archivo y la ruta de la nueva imagen
            console.log("Nuevo nombre de archivo y ruta de imagen:", newFileName, newImagePath);
        } else {
            // Si no se proporciona una nueva imagen, pero el código o el nombre del module cambian, actualiza el nombre de archivo de la imagen si es necesario
            if (req.body.code !== moduleExistente.code || req.body.name !== moduleExistente.name) {
                // Construir el nuevo nombre de archivo único para la imagen
                const newFileName = `${req.body.code}-${req.body.name}${path.extname(moduleExistente.image)}`;

                // Generar la nueva ruta de la imagen
                const newImagePath = path.join('uploads/modules/', newFileName);

                // Renombrar la imagen en el sistema de archivos
                if (fs.existsSync(moduleExistente.image)) {
                    fs.renameSync(moduleExistente.image, newImagePath);
                }

                // Actualizar la ruta de la imagen en los datos a actualizar
                updateData.image = newImagePath;
            }
        }

        // Actualizar los datos del module
        const moduleModificado = await Modules.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(moduleModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar el module. ' + error });
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

//Ajustar estado de module
ModulesRouter.patch("/:id/state", (req,res)=>{
    Modules.findByIdAndUpdate(req.params.id, {state: req.body.state}, {new: true})
    .then(moduleModificado => res.json(moduleModificado))
    .catch(error => res.json({mensaje: error}));
});

//Eliminar module
ModulesRouter.delete("/:id", (req,res)=>{
    Modules.deleteOne({_id: req.params.id})
        .then(datos=> res.json(datos))
        .catch(error=> res.json({mensaje:error}))
});

module.exports = ModulesRouter;
const express = require('express');
const multer = require('multer');
const path = require('path');
const Courses = require('../models/courses');
const CoursesRouter = express.Router();
const fs = require('fs');
const { log } = require('console');

// Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/courses/');
    },
    filename: (req, file, cb) => {
        const fileName = `${req.body.code}-${req.body.name}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

//Guardar course
const upload = multer({ storage: storage });
CoursesRouter.post("/", upload.single('image'), (req, res) => {
    const course = new Courses({
        ...req.body,
        image: req.file.path
    });

    course.save()
        .then(data => {
            console.log(data);
            res.json(data);
        })
        .catch(error => {
            console.log(error);
            res.json({ mensaje: error });
        });
});

// Modificar curso
CoursesRouter.put("/:id", upload.single('image'), async (req, res) => {
    try {
        const cursoExistente = await Courses.findById(req.params.id);

        let updateData = { ...req.body }; // Copiar todos los datos del cuerpo de la solicitud

        // Verificar si se proporciona una nueva imagen
        if (req.file) {
            // Verificar si la imagen existente y la nueva imagen tienen extensiones diferentes
            if (cursoExistente && cursoExistente.image && path.extname(cursoExistente.image) !== path.extname(req.file.originalname)) {
                // Eliminar la imagen existente si tienen extensiones diferentes
                if (fs.existsSync(cursoExistente.image)) {
                    fs.unlinkSync(cursoExistente.image);
                    console.log("La imagen anterior fue eliminada correctamente.");
                }
            }

            // Generar un nuevo nombre de archivo único para la imagen
            const newFileName = `${req.body.code}-${req.body.name}${path.extname(req.file.originalname)}`;
            const newImagePath = path.join('uploads/courses/', newFileName);

            // Actualizar la ruta de la imagen en multer
            req.file.path = newImagePath;

            updateData.image = newImagePath;

            // Imprimir el nombre de archivo y la ruta de la nueva imagen
            console.log("Nuevo nombre de archivo y ruta de imagen:", newFileName, newImagePath);
        } else {
            // Si no se proporciona una nueva imagen, pero el código o el nombre del curso cambian, actualiza el nombre de archivo de la imagen si es necesario
            if (req.body.code !== cursoExistente.code || req.body.name !== cursoExistente.name) {
                // Construir el nuevo nombre de archivo único para la imagen
                const newFileName = `${req.body.code}-${req.body.name}${path.extname(cursoExistente.image)}`;

                // Generar la nueva ruta de la imagen
                const newImagePath = path.join('uploads/courses/', newFileName);

                // Renombrar la imagen en el sistema de archivos
                if (fs.existsSync(cursoExistente.image)) {
                    fs.renameSync(cursoExistente.image, newImagePath);
                }

                // Actualizar la ruta de la imagen en los datos a actualizar
                updateData.image = newImagePath;
            }
        }

        // Actualizar los datos del curso
        const cursoModificado = await Courses.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(cursoModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar el curso. ' + error });
    }
});


//Listar Courses
CoursesRouter.get("/", (req,res)=>{
    Courses.find()
        .then(datos => res.json({Courses:datos}))
        .catch(error=>res.json({mensaje:error}))
});

//Obtener course por id
CoursesRouter.get("/:id", (req,res)=>{
    Courses.findById({_id: req.params.id})
        .then(datos=>res.json(datos))
        .catch(error=>res.json({mensaje:error}))
});

//Ajustar estado de curso
CoursesRouter.patch("/:id/state", (req,res)=>{
    Courses.findByIdAndUpdate(req.params.id, {state: req.body.state}, {new: true})
    .then(cursoModificado => res.json(cursoModificado))
    .catch(error => res.json({mensaje: error}));
});

//Eliminar course
CoursesRouter.delete("/:id", (req,res)=>{
    Courses.deleteOne({_id: req.params.id})
        .then(datos=> res.json(datos))
        .catch(error=> res.json({mensaje:error}))
});

module.exports = CoursesRouter;
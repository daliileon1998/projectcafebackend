const express = require('express');
const multer = require('multer');
const path = require('path');
const Courses = require('../models/courses');
const CoursesRouter = express.Router();
const fs = require('fs');

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


// Modificar course
CoursesRouter.put("/:id", upload.single('image'), async (req, res) => {
    try {
        const cursoExistente = await Courses.findById(req.params.id);

        let updateData = {};

        // Verificar si se proporciona una nueva imagen
        if (req.file) {
            // Eliminar la imagen existente, si existe
            if (cursoExistente && cursoExistente.image && fs.existsSync(cursoExistente.image)) {
                fs.unlinkSync(cursoExistente.image);
            }

            // Guardar la nueva imagen con el nombre actualizado
            const fileName = `${req.body.code}-${req.body.name}${path.extname(req.file.originalname)}`;
            const imagePath = path.join('uploads/courses/', fileName);

            // Actualizar la ruta de la imagen en multer
            req.file.path = imagePath;

            updateData.image = imagePath;
        } else {
            // Si no se proporciona una nueva imagen, verificar si se modificó el código y/o nombre
            if (req.body.code !== cursoExistente.code || req.body.name !== cursoExistente.name) {
                // Construir el nuevo nombre de la imagen con el código y nombre actualizados
                const newImageName = `${req.body.code}-${req.body.name}${path.extname(cursoExistente.image)}`;
                // Renombrar la imagen en el sistema de archivos
                if (fs.existsSync(cursoExistente.image)) {
                    fs.renameSync(cursoExistente.image, path.join(path.dirname(cursoExistente.image), newImageName));
                    // Actualizar la ruta de la imagen en los datos a actualizar
                    updateData.image = path.join(path.dirname(cursoExistente.image), newImageName);
                }
            }
        }

        // Actualizar los datos del curso
        const cursoModificado = await Courses.findByIdAndUpdate(req.params.id, { ...req.body, ...updateData }, { new: true });

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
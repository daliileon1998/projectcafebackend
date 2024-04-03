const express = require('express');
const multer = require('multer');
const path = require('path');
const Modules = require('../models/module');
const Courses = require('../models/courses');
const ModulesRouter = express.Router();
const fs = require('fs');
const { log } = require('console');

// Configuración de multer para manejar la carga de imágenes y documentos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'imagen') {
            cb(null, 'uploads/modules/');
        } else if (file.fieldname === 'documentos') {
            cb(null, 'uploads/modules/documents/');
        } else {
            cb(new Error('Campo de archivo no válido'));
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'imagen') {
            // Utilizar el código y el nombre de la lección para las imágenes
            cb(null, `${req.body.code}-${req.body.name}${path.extname(file.originalname)}`);
        } else if (file.fieldname === 'documentos') {
            // Mantener el nombre original del archivo para los documentos
            cb(null, file.originalname);
        } else {
            cb(new Error('Campo de archivo no válido'));
        }
    }
});

// Crear objeto multer y pasar la configuración de almacenamiento
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño de archivo: 5 MB
    fileFilter: (req, file, cb) => {
        // Comprobar si el archivo es una imagen o un documento
        if (file.fieldname === 'imagen') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Solo se permiten archivos de imagen.'));
            }
        } else if (file.fieldname === 'documentos') {
            if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
                return cb(new Error('Solo se permiten archivos de documento.'));
            }
        }
        cb(null, true);
    }
});

// Guardar módulo con imágenes y documentos
ModulesRouter.post("/", upload.fields([{ name: 'imagen', maxCount: 1 }, { name: 'documentos', maxCount: 5 }]), async (req, res) => {
    try {
        const imagen = req.files['imagen'] ? req.files['imagen'][0].path : '';
        const documentos = req.files['documentos'] ? req.files['documentos'].map(file => ({
            name: file.originalname,  // Corregir el nombre del campo de nombre
            route: file.path           // Corregir el nombre del campo de ruta
        })) : [];

        console.log("documentos ---------->", documentos);

        const module = new Modules({
            ...req.body,
            image: imagen,
            documents: documentos
        });

        const data = await module.save();
        console.log(data);
        res.json(data);
    } catch (error) {
        console.log(error);
        res.json({ mensaje: error });
    }
});


// Modificar módulo con imágenes y documentos
ModulesRouter.put("/:id", upload.fields([{ name: 'imagen', maxCount: 1 }, { name: 'documentos', maxCount: 5 }]), async (req, res) => {
    try {
        const moduleExistente = await Modules.findById(req.params.id);

        let updateData = { ...req.body };

        if (req.files['imagen']) {
            updateData.image = req.files['imagen'][0].path;
        }

        if (req.files['documentos'] && req.files['documentos'].length > 0) {
            const nuevosDocumentos = req.files['documentos'].map(file => ({
                nombre: file.originalname,
                ruta: file.path
            }));
            updateData.documents = [...moduleExistente.documents, ...nuevosDocumentos];
        }

        const moduleModificado = await Modules.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(moduleModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar el módulo. ' + error });
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


//Obtener module por id curso
ModulesRouter.get("/courses/:id", (req,res)=>{
    Modules.find({'course.id': req.params.id, 'state' : 1 })
        .then(datos=>res.json(datos))
        .catch(error=>res.json({mensaje:error}))
});

ModulesRouter.get("/coursesmodules/:id", async (req, res) => {
    try {
        // Obtener el módulo específico
        const modulo = await Modules.findById(req.params.id);
        if (!modulo) {
            return res.status(404).json({ mensaje: "Módulo no encontrado" });
        }
        
        // Obtener las lecciones del módulo
        const leccionesModulo = modulo.lessons; // Asume que las lecciones están almacenadas en un campo llamado 'lecciones'

        // Obtener el ID del curso del módulo
        const cursoId = modulo.course.id;
        
        // Buscar todos los módulos del curso
        const modulosCurso = await Modules.find({ 'course.id': cursoId });

        // Filtrar el curso específico
        const curso = await Courses.findById(cursoId);
        if (!curso) {
            return res.status(404).json({ mensaje: "Curso no encontrado" });
        }

        return res.json({ curso, modulosCurso, leccionesModulo,modulo });
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al obtener los datos", error });
    }
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
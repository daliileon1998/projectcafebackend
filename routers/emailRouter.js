const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const EmailRouter = express.Router();

EmailRouter.use(bodyParser.json());
EmailRouter.use(bodyParser.urlencoded({ extended: true }));

// Ruta para manejar el envío del formulario de contacto
EmailRouter.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Configuración del transporte de correo
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Puedes usar cualquier otro servicio de correo electrónico
        auth: {
            user: 'projectcafe2024@gmail.com', // Cambia esto por tu dirección de correo electrónico
            pass: 'lzxd pzkl jcin zgbj' // Cambia esto por tu contraseña
        }
    });

    // Configuración del mensaje de correo
    const mailOptions = {
        from: `${name} <${email}>`,
        to: 'hernandres1015@gmail.com',
        cc: email,
        subject: 'Mensaje de contacto desde el formulario de Project Café',
        text: message
    };

    // Envío del correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error al enviar el correo electrónico:', error);
            res.status(500).json({ message: 'Error al enviar el correo electrónico' });
        } else {
            console.log('Correo electrónico enviado:', info.response);
            res.json({ message: 'Correo electrónico enviado con éxito' });
        }
    });
});

module.exports = EmailRouter;

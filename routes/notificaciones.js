const express = require('express');
const Notificacion = require('../models/Notificacion');
const Evento = require('../models/Evento');
const Asistente = require('../models/Asistente');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configurar nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
    }
});

// Enviar notificación a los asistentes de un evento
router.post('/', async (req, res) => {
    try {
        const { eventoId, mensaje } = req.body;
        const evento = await Evento.findById(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

        const asistentes = await Asistente.find();
        for (const asistente of asistentes) {
            await new Notificacion({
                mensaje,
                evento: eventoId,
                asistente: asistente._id
            }).save();

            // Enviar email
            await transporter.sendMail({
                from: process.env.EMAIL_HOST_USER,
                to: asistente.email,
                subject: `Notificación sobre el evento: ${evento.titulo}`,
                text: mensaje
            });
        }

        res.status(201).json({ message: 'Notificaciones enviadas correctamente' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

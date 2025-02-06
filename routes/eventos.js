const express = require('express');
const Evento = require('../models/Evento');
const router = express.Router();

// Crear un nuevo evento
router.post('/', async (req, res) => {
    try {
        const nuevoEvento = new Evento(req.body);
        const eventoGuardado = await nuevoEvento.save();
        res.status(201).json(eventoGuardado);
    } catch (err) {
        res.status(400).json(err);
    }
});

// Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const eventos = await Evento.find();
        res.json(eventos);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

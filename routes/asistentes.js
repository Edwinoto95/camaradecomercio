const express = require('express');
const Asistente = require('../models/Asistente');
const router = express.Router();

// Crear un nuevo asistente
router.post('/', async (req, res) => {
    try {
        const nuevoAsistente = new Asistente(req.body);
        const asistenteGuardado = await nuevoAsistente.save();
        res.status(201).json(asistenteGuardado);
    } catch (err) {
        res.status(400).json(err);
    }
});

// Obtener todos los asistentes
router.get('/', async (req, res) => {
    try {
        const asistentes = await Asistente.find();
        res.json(asistentes);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

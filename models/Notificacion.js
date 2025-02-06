const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    mensaje: { type: String, required: true },
    evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
    asistente: { type: mongoose.Schema.Types.ObjectId, ref: 'Asistente', required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);

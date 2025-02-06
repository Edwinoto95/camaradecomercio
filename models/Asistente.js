const mongoose = require('mongoose');

const asistenteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Asistente', asistenteSchema);

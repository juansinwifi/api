const mongoose = require('mongoose');
const Joi = require('joi');

const typificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200,
        uppercase: true
    }
});

const Typifications = mongoose.model('Typification', typificationSchema);

//Funcion de Validación de Campos del Tipificaciones
function validateTypifications(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Typifications = Typifications;
module.exports.validateTypifications = validateTypifications;
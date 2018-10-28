const mongoose = require('mongoose');
const Joi = require('joi');

const rejectsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    } 
});

const Rejects =  mongoose.model('Rejects', rejectsSchema);

//Funcion de Validación de Campos de rejects
function validatereject(requiement) {

    const schema = {
        name: Joi.string().min(2).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Rejects = Rejects;
module.exports.validate = validatereject;

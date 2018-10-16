const mongoose = require('mongoose');
const Joi = require('joi');

const caseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        uppercase: true
        
    },
    description: {
        type: String,
        minlength: 3,
        maxlength: 200
    },
    rejection: {
        type: Boolean,
        required: true
    }
});

const Cases =  mongoose.model('Cases', caseSchema);

//Funcion de Validación de Campos de Gestuón de Casos
function validateCase(requiement) {

    const schema = {
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        rejection: Joi.boolean().required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Cases = Cases;
module.exports.validate = validateCase;

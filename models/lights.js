const mongoose = require('mongoose');
const Joi = require('joi');

const lightsSchema = new mongoose.Schema({
    green: {
        type: Number,
        required: true,
    }, 
    yellow: {
        type: Number,
        required: true,
    }, 
    red: {
        type: Number,
        required: true,
    }, 
    name: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    }, 
    observations:{
        type: String
    }  
});

const Lights =  mongoose.model('lights', lightsSchema);


//Funcion de Validación de Campos de Contactos
function validateLight(requiement) {

    const schema = {
        green: Joi.number().required(),
        yellow: Joi.number().required(),
        red: Joi.number().required(),
        name: Joi.string().min(3).required(),
        observations: Joi.string(),
    };

    return Joi.validate(requiement, schema);
}

module.exports.Lights = Lights;
module.exports.validate = validateLight;

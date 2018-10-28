const mongoose = require('mongoose');
const Joi = require('joi');

const channelsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    } 
});

const Channels =  mongoose.model('Channels', channelsSchema);

//Funcion de Validación de Campos de Contactos
function validateChannels(requiement) {

    const schema = {
        name: Joi.string().min(2).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Channels = Channels;
module.exports.validate = validateChannels;

const mongoose = require('mongoose');
const Joi = require('joi');

const requirementsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    } ,
    sms: {
        type: Boolean,
        required: true,
    }, 
    written: {
        type: Boolean,
        required: true,
    }, 
    medium: {
        type: String,
        required: true,
        uppercase: true
    }, 
    times: {
        type: String,
        required: true,
    }, 
    days: {
        type: Number,
        required: true,
    }, 
    hours: {
        type: Number,
        required: true,
    },
    trackingDate:{
        type: Boolean,
        required: true
    } 
});

const Requirements =  mongoose.model('Requirements', requirementsSchema);

//Funcion de Validación de Campos del Requirimieto
function validateRequirements(requiement) {

    const schema = {
        type: Joi.string().min(3).required(),
        sms: Joi.boolean().required(),
        written: Joi.boolean().required(),
        medium: Joi.string(),
        times: Joi.string().min(3).required(),
        days: Joi.number().integer().required(),
        hours: Joi.number().integer().required(),
        trackingDate: Joi.boolean().required(),

    };

    return Joi.validate(requiement, schema);
}

module.exports.Requirements = Requirements;
module.exports.validate = validateRequirements;

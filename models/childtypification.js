const mongoose = require('mongoose');
const Joi = require('joi');

const childtypificationSchema = new mongoose.Schema({
    idParent: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200,
        uppercase: true
    },
    description: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1000
    },
    requirement: {
        type: String,
        required: true
    },
    forms: {
        type: Array,
        required: true,
        minlength: 1
    },
    levels: {
        type: Array,
        required: true,
        minlength: 1
    },
    maxTime: {
        type: Number,
        required: true,
        minlength: 1
    }

});

const ChildTypifications = mongoose.model('ChildTypifications', childtypificationSchema);

//Funcion de Validación de Campos del Tipificaciones Especificas
function validateChildTypifications(requiement) {

    //Para los niveles el ID debe ser menos de 10. 
    const schema = {
        idParent: Joi.string().required(),
        name: Joi.string().min(3).required(),
        description: Joi.string().required(),
        requirement: Joi.string().min(3).required(),
        forms: Joi.array().items(Joi.object()).min(1).required(),
        levels: Joi.array().items(Joi.object()).min(1).required(),
        maxTime: Joi.number().min(1).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Formulario
function validateForms(requiement) {

    const schema = {
        description: Joi.string().min(2).required(),
        type: Joi.number().min(1).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Niveles
function validateLevels(requiement) {

    const schema = {
        area: Joi.string().required(),
        user: Joi.string().required(),
        profile: Joi.string().required(),
        days: Joi.number().max(24).required(),
        hours: Joi.number().max(24).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.ChildTypifications = ChildTypifications;
module.exports.validate = validateChildTypifications;
module.exports.validateForms = validateForms;
module.exports.validateLevels = validateLevels;
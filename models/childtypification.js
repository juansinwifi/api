const mongoose = require('mongoose');
const Joi = require('joi');

const childtypificationSchema = new mongoose.Schema({
    idParent: {
        type: ObjectId,
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
        type: Number,
        required: true,
        minlength: 1
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

const ChildTypifications = mongoose.model('Typification', caseSchema);

//Funcion de Validación de Campos del Tipificaciones Especificas
function validateChildTypifications(requiement) {

    //Para los niveles el ID debe ser menos de 10. 
    const schema = {
        idParent: Joi.number().min(1).required(),
        name: Joi.string().min(3).required(),
        description: Joi.string().required(),
        requirement: Joi.number().min(1).required(),
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
        area: Joi.number().required(),
        user: Joi.number().required(),
        profile: Joi.number().required(),
        days: Joi.number().max(24).required(),
        hours: Joi.number().max(24).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.ChildTypifications = ChildTypifications;
module.exports.validate = validateChildTypifications;
module.exports.validateForms = validateForms;
module.exports.validateLevels = validateLevels;
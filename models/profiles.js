const mongoose = require('mongoose');
const Joi = require('joi');

const profilesSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        uppercase: true
        
    },
    permissions: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1,
        uppercase: true
    },
    total:{
        type: Number,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    requirements:{
        type: Boolean,
        required: true
    },
    profiles:{
        type: Boolean,
        required: true
    },
    areas:{
        type: Boolean,
        lowercase: true,
        required: true
    },
    users:{
        type: Boolean,
        required: true
    },
    typifications:{
            enable:{
                type: Boolean,
                require: true
            },
            available:{
                type: Array
            }
    },
    case:{
        type: Boolean,
        required: true
    },
    case:{
        type: Boolean,
        required: true
    },
    channel:{
        type: Boolean,
        required: true
    },
    contact:{
        type: Boolean,
        required: true
    },
    lights:{
        type: Boolean,
        required: true
    },
    rejection:{
        type: Boolean,
        required: true
    }
});

const Profiles = mongoose.model('Profiles', profilesSchema);

//Funcion de Validación de Campos del Perfil
function validateProfile(requiement) {

    const schema = {
        type: Joi.string().min(3).required(),
        permissions: Joi.string().max(1).empty(' ').required(),
        requirements: Joi.boolean().required(),
        profiles: Joi.boolean().required(),
        areas: Joi.boolean().required(),
        users: Joi.boolean().required(),
        typifications: Joi.object().required(),
        case: Joi.boolean().required(),
        channel: Joi.boolean().required(),
        contact: Joi.boolean().required(),
        lights: Joi.boolean().required(),
        rejection: Joi.boolean().required()
    };


    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos de Tipificación en el Perfil
function validateProfileTypifications(requiement) {

    const schema = {
        enable: Joi.boolean().required()
    };

    if (requiement.enable == true) schema.available = Joi.array().items(Joi.string().required()).required()
    if (requiement.enable == false) schema.available = Joi.array()


    return Joi.validate(requiement, schema);
}

//Cuenta el numero de Permisos que tiene (# Trues)
function countPermissions(requiement) {

    let countPermissions = 0

    if (requiement.requirements) countPermissions++;
    if (requiement.profiles) countPermissions++;
    if (requiement.areas) countPermissions++;
    if (requiement.users) countPermissions++;
    if (requiement.typifications.enable) countPermissions++;
    if (requiement.case) countPermissions++;
    if (requiement.channel) countPermissions++;
    if (requiement.contact) countPermissions++;
    if (requiement.lights) countPermissions++;
    if (requiement.rejection) countPermissions++;

    return countPermissions;
}

module.exports.Profiles = Profiles;
module.exports.validateProfile = validateProfile;
module.exports.validateProfileTypifications = validateProfileTypifications;
module.exports.countPermissions = countPermissions;

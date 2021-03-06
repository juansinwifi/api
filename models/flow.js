const mongoose = require('mongoose');
const Joi = require('joi');

//FLujo
const flowSchema = new mongoose.Schema({
    record:{
        type: String,
        required: true
    },
    user:{
        type: String,
        required: true
    },
    level:{     
        type: Number,
        required: true
    },  
    status:{
        type: Boolean,
        required: true
    },
    observations:{
        type: String
    },
    finDate:{
        type: String
    },
    light:{
        type: Number
    },
    case:{
        type: Number
    },
    reject:{
        type: String
    },
    timestamp:{
        type: String,
        required: true
    },
    file:{
        type: String
    }

});

const Flow =  mongoose.model('flow', flowSchema);

//Funcion de Validación de Campos del Radicado
function validateFlow(requiement) {

    const schema = {
        record: Joi.string().min(24).required(),
        user: Joi.string().min(24),
        observations: Joi.string().required(),
        case: Joi.number().min(1).required(),
        reject: Joi.string().min(24).required(),
        file: Joi.string().allow('')
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Radicado
function validateSearch(requiement) {

    const schema = {
        user: Joi.number().required(),
        filter: Joi.number().required(),
        search: Joi.string().required()
       
    };

    return Joi.validate(requiement, schema);
}

module.exports.Flow = Flow;
module.exports.validateFlow = validateFlow;
module.exports.validateSearch = validateSearch;
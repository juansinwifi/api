const mongoose = require('mongoose');
const Joi = require('joi');

//Contador de Radicados
const countRecordsSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true
    } 
});
const CountRecords =  mongoose.model('Counters', countRecordsSchema);


//Radicados
const recordSchema = new mongoose.Schema({
    number:{
        type: Number,
        required: true
    },
    customer:{
        type: Number,
        required: true
    },
    typification: {
            type: String,
            required: true
    },
    child: {
            type: String,
            required: true
    },
    channel: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    forms: {
        type: Array
     },
    file: {
        type: String
    },
    status:{
        type: Boolean,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    caseFinTime:{
        type: Number,
        required: true
    },
    caseFinDate: {
        type: String,
        required: true
    },
    caseLight: {
        type: Number,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    levels: {
        type: Array,
        required: true
    }

});

const Records = mongoose.model('records', recordSchema);


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
    }   
});

const Flow =  mongoose.model('flow', flowSchema);
//Funcion de Validación de Campos del Radicado
function validateRecords(requiement) {

    const schema = {
        customer: Joi.number().min(1).required(),
        typification: Joi.string().min(1).required(),
        child: Joi.string().min(1).required(),
        channel: Joi.string().min(1).required(),
        contact:Joi.string().min(1).required(),
        forms: Joi.array().items(Joi.object()).min(1).required(),
        file: Joi.string().min(1),
        observations: Joi.string(),
        status: Joi.boolean().required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Records = Records;
module.exports.Counter = CountRecords;
module.exports.Flow = Flow;
module.exports.validate = validateRecords;

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
    customerName:{
        type: Number
    },
    ref:{
        type: Number
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
    trackingDate:{
        type: String
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
    trackingDate:{
        type: String
    },
    area: {
        type: String,
        required: true
    },
    levels: {
        type: Array,
        required: true
    },
    createdBy:{
        type: String,
        required: true
    }

});
const Records = mongoose.model('records', recordSchema);

//Funcion de Validación de Campos del Radicado
function validateRecords(requiement) {

    const schema = {
        customer: Joi.number().min(1).required(),
        customerName: Joi.string(),
        ref: Joi.number().min(1),
        typification: Joi.string().min(24).required(),
        child: Joi.string().min(24).required(),
        channel: Joi.string().min(24).required(),
        contact:Joi.string().min(24).required(),
        forms: Joi.array(),
        file: Joi.any(),
        observations: Joi.string(),
        trackingDate: Joi.date(),
        status: Joi.boolean(),
        user: Joi.string().min(24).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos de Gestuón de Casos
function validateReport(requiement) {

    const schema = {
       status: Joi.boolean().required(),
       user: Joi.string()
    };

    return Joi.validate(requiement, schema);
}



module.exports.Records = Records;
module.exports.Counter = CountRecords;
module.exports.validate = validateRecords;
module.exports.validateReport = validateReport;
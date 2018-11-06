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

//Funcion de Validación de Campos del Radicado
function validateRecords(requiement) {

    const schema = {
        customer: Joi.number().min(1).required(),
        typification: Joi.string().min(24).required(),
        child: Joi.string().min(24).required(),
        channel: Joi.string().min(24).required(),
        contact:Joi.string().min(24).required(),
        forms: Joi.array().items(Joi.object()).min(1).required(),
        file: Joi.string().min(1),
        observations: Joi.string(),
        status: Joi.boolean()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Records = Records;
module.exports.Counter = CountRecords;
module.exports.validate = validateRecords;

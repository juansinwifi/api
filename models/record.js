const mongoose = require('mongoose');
const Joi = require('joi');

const recordSchema = new mongoose.Schema({
    number:{
        type: Number,
        required: true
    },
    date:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        uppercase: true
    },
    typification: {
        type: String,
        required: true
    },
    child: {
        type: String,
        required: true
    },
    channel:{
        type: String,
        requerid: true
    },
    contact:{
        type: String,
        required: true
    },
   forms:{
       type: Array
   },
   file:{
       type: String,
       minlength: 3,
       maxlength: 100,
   }

});

const Records = mongoose.model('Records', recordSchema);


//Contador de Radicados

const countRecordsSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true
    } 
});

const CountRecords =  mongoose.model('Counters', countRecordsSchema);


//Funcion de Validación de Campos del Radicado
function validateRecords(requiement) {

    const schema = {
        typification: Joi.string().min(1).required(),
        child: Joi.string().min(1).required(),
        channel: Joi.string().min(1).required(),
        contact:Joi.string().min(1).required(),
        forms: Joi.array().items(Joi.object()).min(1).required(),
        file: Joi.string().min(1)
    };

    return Joi.validate(requiement, schema);
}

module.exports.Records = Records;
module.exports.Counter = CountRecords;
module.exports.validate = validateRecords;

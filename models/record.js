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

//Funcion de Validación de Campos del Radicado
function validateRecords(requiement) {

    const schema = {

        number:Joi.number().min(1).required(),
        date: Joi.string().min(8).required(),
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
module.exports.validate = validateRecords;

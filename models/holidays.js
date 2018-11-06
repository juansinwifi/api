const mongoose = require('mongoose');
const Joi = require('joi');

//FLujo
const holidaySchema = new mongoose.Schema({
    date:{
        type: String,
        unique: true
    }
});

const Holiday =  mongoose.model('holiday', holidaySchema);

//Funcion de Validación de Campos del Radicado
function validateHoliday(requiement) {

    const schema = {
        //date: Joi.string().min(8).required()
        date: Joi.date().required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Holiday = Holiday;
module.exports.validateHoliday = validateHoliday;
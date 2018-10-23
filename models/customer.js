const mongoose = require('mongoose');
const Joi = require('joi');

const customersSchema = new mongoose.Schema({
    identification: {
        type: Number,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true,
        uppercase: true
    },
    tc:{
        type: String,
        required: true,
        uppercase: true
    },
    phone1:{
        type: String,
        uppercase: true
    },
    phone2:{
        type: String,
        uppercase: true
    },
    clinic:{
        type: String,
        uppercase: true
    },
    date:{
        type: String,
        uppercase: true
    },
    pastdueDate:{
        type: String,
        uppercase: true
    },
    pastdueValue:{
        type: Number
    },
    gag:{
        type: String,
        uppercase: true
    },
    minPayment:{
        type: Number
    },
    fee:{
        type: Number
    },
    quota:{
        type: Number
    },
    totalPayment:{
        type: Number
    },
    affinity:{
        type: String,
        uppercase: true
    },
    production:{
        type: Number,
        uppercase: true
    }
});

//Funcion de Validación de Campos del Perfil
function validateCustomer(requiement) {

    const schema = {
        identification: Joi.number().min(3).required(),
        name: Joi.string().min(3).required(),
        tc: Joi.string(),
        phone1: Joi.string(),
        phone2: Joi.string(),
        clinic: Joi.string(),
        date: Joi.string(),
        pastdueDate: Joi.string(),
        pastdueValue: Joi.number(),
        gag: Joi.string(),
        minPayment: Joi.number(),
        fee: Joi.number(),
        quota: Joi.number(),
        totalPayment: Joi.number(),
        affinity: Joi.string(),
        production: Joi.number()
    };


    return Joi.validate(requiement, schema);
}

const Customer = mongoose.model('Customers', customersSchema);

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
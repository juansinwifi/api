const mongoose = require('mongoose');
const Joi = require('joi');

const customersSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name:{
        type: String,
        uppercase: true,
        required: true
    },
    affinity:{
        type: String,
        uppercase: true
    }, 
    ref:{
        type: String,
        required: true,
        unique: true,
        uppercase: true
    }, 
    quote:{
        type: String,
        required: true,
        uppercase: true
    },
    clinic:{
        type: String,
        uppercase: true
    }, 
    production:{
        type: String,
        uppercase: true
    }, 
    limitDate:{
        type: String,
        uppercase: true
    }, 
    minPay:{
        type: String,
        uppercase: true
    }, 
    pastdueAge:{
        type: String,
        uppercase: true
    }, 
    pastdueDate:{
        type: String,
        uppercase: true
    }, 
    gag:{
        type: String,
        uppercase: true
    }, 
    totalPay:{
        type: String,
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
    email:{
        type: String,
        uppercase: true
    },
    mouthV: {
        type: String,
        uppercase: true
    }, 
    mouthP:{
        type: String,
        uppercase: true
    }
});

//Funcion de Validación de Campos del Perfil
function validateCustomer(requiement) {

    const schema = {
        id: Joi.string().min(3).required(),
        name: Joi.string().allow(''),
        affinity: Joi.string().allow(''),
        ref: Joi.string().min(3).required(),
        quote: Joi.string().allow(''),
        clinic: Joi.string().allow(''),
        production: Joi.string().allow(''),
        limitDate: Joi.string().allow(''),
        minPay: Joi.string().allow(''),
        pastdueAge: Joi.string().allow(''),
        pastdueDate: Joi.string().allow(''),
        gag: Joi.string().allow(''),
        totalPay: Joi.string().allow(''),
        phone1: Joi.string().allow(''),
        phone2: Joi.string().allow(''),
        email: Joi.string().allow(''),
        mouthV: Joi.string().allow(''),
        mouthP: Joi.string().allow('')
    };


    return Joi.validate(requiement, schema);
}

const Customer = mongoose.model('Customers', customersSchema);


//Funcion de Validación de Campos del Perfil
function validateInformation(req) {

    const schema = {
        phone1: Joi.string().required(),
        phone2: Joi.string().required(),
        email: Joi.string().required(),
        user: Joi.string().min(24).required()
    };


    return Joi.validate(req, schema);
}
module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
module.exports.validateInformation = validateInformation;
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
    }
});

//Funcion de Validación de Campos del Perfil
function validateCustomer(requiement) {

    const schema = {
        id: Joi.string().min(3).required(),
        name: Joi.string(),
        affinity: Joi.string(),
        ref: Joi.string().min(3).required(),
        quote: Joi.string(),
        clinic: Joi.string(),
        production: Joi.string(),
        limitDate: Joi.string(),
        minPay: Joi.string(),
        pastdueAge: Joi.string(),
        pastdueDate: Joi.string(),
        gag: Joi.string(),
        totalPay: Joi.string(),
        phone1: Joi.string(),
        phone2: Joi.string(),
        email: Joi.string()
    };


    return Joi.validate(requiement, schema);
}

const Customer = mongoose.model('Customers', customersSchema);


//Funcion de Validación de Campos del Perfil
function validateInformation(req) {

    const schema = {
        id: Joi.string().min(3).required(),
        phone1: Joi.string(),
        phone2: Joi.string(),
        email: Joi.string()
    };


    return Joi.validate(requiement, schema);
}
module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
module.exports.validateInformation = validateInformation;
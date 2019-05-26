const mongoose = require('mongoose');
const Joi = require('joi');

const customersUpdatesSchema = new mongoose.Schema({
    customer:{
        type: String,
        required: true
    },
    name:{
        type: String
    },
    user:{
        type: String,
        required: true
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
        lowercase: true
    },
    date:{
        type: String,
        required: true
    }
});



const CustomersUpdates = mongoose.model('CustomersUpdates', customersUpdatesSchema);

module.exports.CustomersUpdates = CustomersUpdates;
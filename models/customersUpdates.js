const mongoose = require('mongoose');
const Joi = require('joi');

const customersUpdatesSchema = new mongoose.Schema({
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
    }
});



const CustomersUpdates = mongoose.model('CustomersUpdates', customersUpdatesSchema);

module.exports.CustomersUpdates = CustomersUpdates;
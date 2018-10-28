const mongoose = require('mongoose');
const Joi = require('joi');

const contactsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    } 
});

const Contacts =  mongoose.model('Contacts', contactsSchema);

//Funcion de Validación de Campos de Contactos
function validateContacts(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Contacts = Contacts;
module.exports.validate = validateContacts;

const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    active:{
        type: Boolean,
        required: true
    },
    user:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1024
    },
    identification:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 250,
        uppercase: true
    },
    email:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        unique: true
    },
    phone:{
        type: Number,
        required: true
    },
    profiles:{
        type: Array,
        minlength: 1,
        require: true
    },
    area:{
        type: Number,
        required: true,
        uppercase: true
    },
    country:{
        type: String,
        uppercase: true,
        required: true
    }
});

userSchema.methods.generateAuthToken = function()  {
    const token = jwt.sign({_id: this.id}, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('Users', userSchema);

//Funcion de Validación de Campos de Usuario
function validateUser(user) {

    const schema = {
        active: Joi.boolean().required(),
        user: Joi.string().min(3).required(),
        password: Joi.string().min(6).required(),
        identification: Joi.number().required(),
        name: Joi.string().min(3).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        phone: Joi.number().min(7).required(),
        profiles: Joi.array().items(Joi.string()).min(1).required(),
        area: Joi.number().min(1).required(),
        country: Joi.string().min(3).required()
    };

    return Joi.validate(user, schema);
}

module.exports.validate = validateUser;
module.exports.Users = User;
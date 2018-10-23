const mongoose = require('mongoose');
const Joi = require('joi');

const recordSchema = new mongoose.Schema({
    date:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        uppercase: true
    },
    typification: {
        type: ObjectId,
        required: true
    },
    child: {
        type: ObjectId,
        required: true
    },
    channel:{
        type: ObjectId,
        requerid: true
    },
    contact:{
        type: ObjectId,
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
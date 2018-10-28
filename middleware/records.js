const {Counter} = require('../models/record');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


async function validateCounter () {

    const count =  await Counter.find();
   
    //Si no existe, no es un arreglo o esta vacio
    if ( !Array.isArray(count) || !count.length){
        //appDebuger("El contador esta Vacio " + count);
        let createCount = new Counter({
            count: 1
        });
        createCount =  createCount.save();  
        return  false;
    }
    else{
        return  true;
    }
    
}

async function updateCounter(){
    const count =  await Counter.find();
    const updateCounter = await Counter.findOneAndUpdate({"_id": count[0]._id}, {
        $inc: { count: 1 }
    },{
        new: true
    });
    return (updateCounter.count);
    
}



module.exports.validateCounter = validateCounter;
module.exports.updateCounter = updateCounter;

const {Counter, Records } = require('../models/record');
const {Flow} = require('../models/flow');
const appDebuger = require('debug')('app:app');
const _ = require('lodash');
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

async function createRecord ( req ) {

    let record = new Records( _.pick(req, [ 
        "customer",
    "typification",
    "child",
    "channel",
    "contact",
    "forms",
    "file",
    "status",
    "number",
    "date",
    "caseFinTime",
    "caseFinDate",
    "caseLight",
    "area",
    "levels"
    ]));

    record = await record.save();
    return record;

}
module.exports.validateCounter = validateCounter;
module.exports.updateCounter = updateCounter;
module.exports.createRecord = createRecord;

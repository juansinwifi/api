const appFlow = require('debug')('app:flow');
const appRecord = require('debug')('app:record');
const appChild = require('debug')('app:child');
const _ = require('lodash');
const {Flow} = require('../models/flow');
const {Records} = require('../models/record');
const {ChildTypifications} = require('../models/childtypification');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment'); //Libreria para manejo de fechas

async function backFlow ( req ) {
    
    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req._id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado.'}); // Error 404 
    //appFlow(currentFlow);
    //Buscar el Radicado
    const record = await Records.findById(currentFlow.record);
    if (!record) return ({'ERROR':'No se encuentran Radicados.'}); // Error 404 
    //appRecord(record);
    //Get Child Typification
    const child = await ChildTypifications.findById(record.child);
    if (!child) return ({'ERROR':'Tipificación Especifica no encontrada'}); // Error 404 
    //appChild(child);
    // Current Level
    const currentLevel = currentFlow.level;
    if (currentLevel == 0) return ({'ERROR':'El flujo se ecuentra en el nivel mas bajo.'});
    
    const newLevel = currentLevel - 1;
    
    
    //Crear el nuevo flujo
       const flow = {};
       flow.record = currentFlow.record;
       flow.user = child.levels[newLevel].user;
       flow.level = newLevel;
       flow.status = true;
       flow.observations = req.observations;
       flow.finDate = await calcFinDate();
       flow.light =  await calcLight();
     
       let newFlow = await createFlow(flow);
       if (!newFlow) return ({'ERROR':'Algo salio mal al crear el flujo.'}); // Error 404 
    /*****************************/
    //Update Status flujo anterior
    /*****************************/
      if(newFlow._id) { 
        const update =  await Flow.findOneAndUpdate({'_id':req._id}, {
            status: false
            },{
                new: true
            });
         //If not existing, return 404 - Not Found
         if (!update) return ({'ERROR':'Algo salio mal al actualizar el flujo.'}); // Error 404 
      }
    // flow = await flow.save();
    return newFlow;
}

async function createFlow ( req ) {

        let flow = new Flow( _.pick(req, [ 
        "record",
        "user",
        "level",
        "status",
        "observations",
        "finDate",
        "light"
        ]));

        flow = await flow.save();
        return flow;
}



async function calcFinDate(){
    let currentTime = moment().format();
    return currentTime;
}

async function calcLight(){
    let light = 100;
    return light;
}

module.exports.backFlow = backFlow;
module.exports.createFlow = createFlow;
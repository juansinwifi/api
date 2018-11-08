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

async function diffDate (ini, fin){

    var now  = moment(ini).format('YYYY-MM-DD HH:mm');
    var then = moment(fin).format('YYYY-MM-DD HH:mm');
    var diff = moment.duration(moment(then).diff(moment(now)));

    var days = parseInt(diff.asDays()); 
    var hours = parseInt(diff.asHours()); 
    hours = hours - days*24;  
    var minutes = parseInt(diff.asMinutes()); 
    minutes = minutes - (days*24*60 + hours*60); 

    diff = {};
    diff.days = days
    diff.hours = hours;
    diff.minutes = minutes;
    
    return diff;
}

async function backFlow ( req ) {
    
    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req.params.id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado.'}); // Error 404 
    if(!currentFlow.status) return ({'ERROR':'El Radicado le pertenece a otro usuario o ya fue cerrado.'}); // Error 404 
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
    

    //Tiempo Total
    // closeTimes = await calcFinDate(currentTime, child._id);
    // lastLevel = closeTimes.levels - 1; //Busco la maxima fecha
    
    //Crear el nuevo flujo
       const flow = {};
       flow.record = currentFlow.record;
       flow.user = child.levels[newLevel].user;
       flow.level = newLevel;
       flow.status = true;
       flow.observations = req.body.observations;
       flow.finDate = await calcFinDate();
       flow.light =  await calcLight();
       flow.case = req.body.case;
       flow.reject = req.body.reject;
       
     
       let newFlow = await createFlow(flow);
       if (!newFlow) return ({'ERROR':'Algo salio mal al crear el flujo.'}); // Error 404 
    /*****************************/
    //Update Status flujo anterior
    /*****************************/
      if(newFlow._id) { 
        const update =  await updateFlow(req.params.id);
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
        "light",
        "case",
        "reject",
        "timestamp"
        ]));

        flow = await flow.save();
        return flow;
}

async function updateFlow (req){
    const update =  await Flow.findOneAndUpdate({'_id':req}, {
        status: false
        },{
            new: true
        });
        return update;
}

async function nextFlow(req){
    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req.params.id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado'}); // Error 404 
    if(!currentFlow.status) return ({'ERROR':'El Radicado le pertenece a otro usuario o ya fue cerrado.'}); // Error 404 
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
    const newLevel = currentLevel + 1;
    
    //Pregunta si existe un siguiente nivel
    // Si el flujo no tiene mas niveles de Escalamiento
   
    //Crear el nuevo flujo
    const flow = {};
    flow.record = currentFlow.record;

    //Si tiene mas niveles
    if(child.levels[newLevel]) {
        flow.user = child.levels[newLevel].user;
        flow.level = newLevel;
        flow.status = true;
        flow.observations = req.body.observations;
        flow.finDate = await calcFinDate();
        flow.light =  await calcLight();
        flow.case = req.body.case;
        flow.reject = req.body.reject;
    }
    else {
        flow.user = req.body.user;
        flow.level = currentLevel;
        flow.status = false;
        flow.observations = req.body.observations;
        flow.finDate = currentFlow.finDate;
        flow.light = currentFlow.light;
        flow.case = req.body.case;
        flow.reject = req.body.reject;
    }

    let newFlow = await createFlow(flow);
    if (!newFlow) return ({'ERROR':'Algo salio mal al crear el flujo.'}); // Error 404 

    if(!flow.status){
        const updateRecord =  await Records.findOneAndUpdate({'_id':flow.record}, {
            status: true
            },{
                new: true
            });
        if (!updateRecord) return ({'ERROR':'Algo salio mal al finalizar el radicado.'}); // Error 404 
    } 
    /*****************************/
    //Update Status flujo anterior
    /*****************************/
    if(newFlow._id) { 
        const update =  await updateFlow(req.params.id);
        //If not existing, return 404 - Not Found
        if (!update) return ({'ERROR':'Algo salio mal al actualizar el flujo.'}); // Error 404 
    }
    // flow = await flow.save();
    return newFlow;

}

async function changeFlow (req){
    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req.params.id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado'}); // Error 404 
    if(!currentFlow.status) return ({'ERROR':'El Radicado le pertenece a otro usuario o ya fue cerrado.'}); // Error 404 
    //appFlow(currentFlow);
    //Buscar el Radicado
    const record = await Records.findById(currentFlow.record);
    if (!record) return ({'ERROR':'No se encuentran Radicados.'}); // Error 404 
    //appRecord(record);
    //Get Child Typification
    const child = await ChildTypifications.findById(record.child);
    if (!child) return ({'ERROR':'Tipificación Especifica no encontrada'}); // Error 404 
    //appChild(child);
    //Crear el nuevo flujo
    const flow = {};
    flow.record = currentFlow.record;
    flow.user = currentFlow.user;
    flow.level = currentFlow.level;;
    flow.status = true;
    flow.observations = req.body.observations;
    flow.finDate = currentFlow.finDate;
    flow.light = currentFlow.light;
    flow.case = req.body.case;
    flow.reject = req.body.reject;

    let newFlow = await createFlow(flow);
    if (!newFlow) return ({'ERROR':'Algo salio mal al crear el flujo.'}); // Error 404 
    /*****************************/
    //Update Status flujo anterior
    /*****************************/
    if(newFlow._id) { 
        const update =  await updateFlow(req.params.id);
        //If not existing, return 404 - Not Found
        if (!update) return ({'ERROR':'Algo salio mal al actualizar el flujo.'}); // Error 404 
    }
    // flow = await flow.save();
    return newFlow;
}

async function closeFlow(req){
    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req.params.id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado'}); // Error 404 
    if(!currentFlow.status) return ({'ERROR':'El Radicado le pertenece a otro usuario o ya fue cerrado.'}); // Error 404 
    //appFlow(currentFlow);
    //Buscar el Radicado
    const record = await Records.findById(currentFlow.record);
    if (!record) return ({'ERROR':'No se encuentran Radicados.'}); // Error 404 
    //appRecord(record);
    //Get Child Typification
    const child = await ChildTypifications.findById(record.child);
    if (!child) return ({'ERROR':'Tipificación Especifica no encontrada'}); // Error 404 
    //appChild(child);
    //Crear el nuevo flujo
    const flow = {};
    flow.record = currentFlow.record;
    flow.user = currentFlow.user;
    flow.level = currentFlow.level;;
    flow.status = false;
    flow.observations = req.body.observations;
    flow.finDate = currentFlow.finDate;
    flow.light = currentFlow.light;
    flow.case = req.body.case;
    flow.reject = req.body.reject;

    let newFlow = await createFlow(flow);
    if (!newFlow) return ({'ERROR':'Algo salio mal al crear el flujo.'}); // Error 404 

    if(!flow.status){
        const updateRecord =  await Records.findOneAndUpdate({'_id':flow.record}, {
            status: true
            },{
                new: true
            });
        if (!updateRecord) return ({'ERROR':'Algo salio mal al finalizar el radicado.'}); // Error 404 
    } 
    /*****************************/
    //Update Status flujo anterior
    /*****************************/
    if(newFlow._id) { 
        const update =  await updateFlow(req.params.id);
        //If not existing, return 404 - Not Found
        if (!update) return ({'ERROR':'Algo salio mal al actualizar el flujo.'}); // Error 404 
    }
    // flow = await flow.save();
    return newFlow;
}

async function assingFlow( req){

    //Buscar el Flujo Actual
    const currentFlow = await Flow.findById(req.params.id);
    if (!currentFlow) return ({'ERROR':'Flujo no econtrado'}); // Error 404 
    if(!currentFlow.status) return ({'ERROR':'El Radicado le pertenece a otro usuario o ya fue cerrado.'});

    const updateUser = await Flow.findByIdAndUpdate(req.params.id, {
        user: req.body.user
    },{
        new: true
    });

    //Return the updated course
    return updateUser;

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
module.exports.nextFlow = nextFlow;
module.exports.changeFlow = changeFlow;
module.exports.closeFlow = closeFlow;
module.exports.assingFlow = assingFlow;
module.exports.diffDate = diffDate;
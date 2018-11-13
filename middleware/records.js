const {Counter, Records } = require('../models/record');
const {Flow} = require('../models/flow');
const {ChildTypifications} = require('../models/childtypification');
const {Holiday} = require('../models/holidays');
const {Areas} = require('../models/areas');
const appDebuger = require('debug')('app:app');
const appDate = require('debug')('app:date');
const appHoliday = require('debug')('app:holiday');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment'); //Libreria para manejo de fechas


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
    "levels",
    "createdBy"
    ]));

    record = await record.save();
    return record;

}

async function checkHoliday( date ){
    let checkDate = moment(date).format("YYYY-MM-DD");
    let myHoliday = await Holiday.findOne({'date': checkDate});
    if(!myHoliday) return false;
    return true; //Es Festivo, no trabajan
}

async function calcFinDate(date, child){
    try {
    const childTypification = await ChildTypifications.findById(child);
    if (!childTypification) return ({'ERROR': 'Tipificación Especifica no encontrada'}); // Error 404 

    let result = {};
    let levels = childTypification.levels;
    let i = 0;

    let iniDate= moment(date);
    let myDay  = moment(iniDate).format("ddd").toLocaleLowerCase();
    appDate('RADICADO: ' + iniDate.format("ddd YYYY-MM-DD HH:mm"));
    while (levels[i]){
        //Tiempo en horas de cada nivel
        let days = levels[i].days * 24;
        let hours = levels[i].hours;
        let total = days + hours;
        let start = 0;
        let closeTime = 0;
        //Buscamos el tiempo en cada area
        let areaId = levels[i].area;
        const area = await Areas.findById(areaId);
        if (!area) return ({'ERROR': 'Area no encontrada'}); // Error 404
        
        let currentDay = area.attention[myDay];
    
        while(total > 0)
        {
                // Restas las horas disponibles hasta que de 0 
                
                let iniH =  0;
                let iniM =  0;
                let iniTime = 0;
                let finH =  0;
                let finM =  0;
                let finTime = 0;
                let spendDay = 0;
                let fin = 0;
                let holiday = false;
                holiday = await checkHoliday(iniDate);
            
                if(!holiday){
                    if(currentDay.check) {
                            //Horas que puedo restar este dia
                            iniH =  currentDay.start.h; //Hora Inicial
                            iniM =  currentDay.start.m; //Minutos Iniciales
                            iniTime = iniH + (iniM / 60); //Todo en Horas
                            finH =  currentDay.fin.h; //Hora Final
                            finM =  currentDay.fin.m; //Minutos Finales
                            finTime = finH + (finM/60); //Todo en Hroas

                            //Establecer la hora inicial y hora final de atencion
                            start = moment(iniDate).set({'hour': iniH, 'minute': iniM, 'second': 0, 'millisecond': 0});
                            fin = moment(iniDate).set({'hour': finH, 'minute': finM, 'second': 0, 'millisecond': 0});
                            
                            
                            /*Si la hora del radicado esta dentro del rango de atencion la hora inicial es la de creacion
                            y no la de atencion */
                            

                            if( iniDate > start && iniDate < fin ){
                                appDate('Es verdad, dentro del rango');
                                start = moment(iniDate); 
                                iniH =  moment(iniDate).hours(); //Hora Inicial
                                iniM =  moment(iniDate).minutes(); //Minutos Iniciales
                                iniTime = iniH + (iniM / 60); //Todo en Horas 
                            }

                            spendDay = finTime - iniTime; //Tiempo que puedo gastar en ese dia

                            //Si el radicado es creado despues de la hora de atención
                            if( iniDate > fin ){
                               spendDay = 0; //No gasto tiempo ese dia
                            }

                            
                            closeTime = moment(start).add(total, 'h');

                            appDate('Inicia: ' + start.format("ddd YYYY-MM-DD HH:mm"));
                            appDate('Nivel ' + i + ' | Total: ' + total + 'h | ' + myDay + ':' + spendDay);
                        
                    }
                }
                // if(holiday) appDate(myDay + ' Es festivo, No Trabaja ');
                // if(!currentDay.check)  appDate(myDay + ' No Trabaja ');

                //Suamamos un dia y reiniciamos el horario inicial 
            
                iniDate = moment(iniDate).add(1 ,'day').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
                appDate('Nuevo Inicio: ' + iniDate.format("ddd YYYY-MM-DD HH:mm"));
                myDay = moment(iniDate).format("ddd").toLocaleLowerCase();
                currentDay = area.attention[myDay];
                total = total - spendDay;
                
            }
            //Le asignamos la hora en que termino el ultimo nivel
            iniDate = closeTime;
            result[i] = moment(closeTime).format("YYYY-MM-DD HH:mm");
            appDate('Fin:' + moment(closeTime).format("YYYY-MM-DD HH:mm"));
        
            i++;
        }
        result.levels = i;
        return result;
    }
    catch(ex){
        console.log(ex);
        return ({'Error': 'Algo salio mal la calcular las fechas :('})
    }
   
}


module.exports.validateCounter = validateCounter;
module.exports.updateCounter = updateCounter;
module.exports.createRecord = createRecord;
module.exports.calcFinDate = calcFinDate;

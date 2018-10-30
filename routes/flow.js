const auth = require('../middleware/auth');
const {Flow} = require('../models/record');
const {Areas} = require('../models/areas');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment');

/***********/
/* Flow    */
/**********/

//'BUSCAR UN Semaforo' GET Method
router.get('/:id', async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const flow = await Flow.findOne({"user._id": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        flow.userLight = 90;
        flow.caseLight = 80;

        
//Timpo del Usuario 

        const iniTime = moment(flow.date);
        let finalTime = null;
        //myTime = myTime.format("ddd, h:mm:ss a");
        let iniDay = iniTime.format("ddd").toLocaleLowerCase();

        //Buscar el area para saber los horarios
        const area = await Areas.findOne({"_id": flow.area});
        if (!area) return res.status(404).send('Area no encontrada'); // Error 404 
        let areaschedule = area.attention[iniDay];

        //Pregunto si el dia en que esta creado el caso el area trabaja
        let  hour  = iniTime.format('H');
        let spendHour = 0; 
        if (areaschedule.check){
            if (areaschedule.start.h >= hour <= areaschedule.fin.h) spendHour = areaschedule.fin.h - hour;
        }
        finalTime = iniTime.add(spendHour, 'hour');

        //Ciclo para encontrar la fecha final
        let userTime = flow.userTime;
        let addDays = iniTime.add(1,'day');
        let day = addDays.format("ddd").toLocaleLowerCase();
        // while (userTime > spendHour){
        //     appDebuger({Time: userTime},{Spend: spendHour}, {day: day});
        //     areaschedule = area.attention[day];
        //     appDebuger(areaschedule);
        //     if (areaschedule.check){
        //          spendHour = areaschedule.fin.h - areaschedule.fin.h;
        //     }
                 
        //     addDays = addDays.add(1,'day');
        //     day = addDays.format("ddd").toLocaleLowerCase();
            
        // }
        // appDebuger({Time: userTime},{Spend: spendHour}, {day: day});
        // myTime = moment(flow.date).add(1,'day');
        // day = myTime.format("ddd").toLocaleLowerCase();
        // appDebuger(day);

        //appDebuger(flow);
        
        const recordTime = {};
        recordTime.ini = moment(flow.date).format("dddd, MMMM Do YYYY, h:mm:ss a");
        recordTime.final = finalTime.format("dddd, MMMM Do YYYY, h:mm:ss a");

        
        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

module.exports = router;
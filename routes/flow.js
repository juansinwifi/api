const auth = require('../middleware/auth');
const {backFlow, nextFlow, changeFlow, closeFlow, assingFlow, diffDate} = require('../middleware/flow');
const {Records} = require('../models/record');
const {Flow, validateFlow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Customer } = require('../models/customer');
const {Lights} = require('../models/lights');
const {Users} = require('../models/user');
const {Areas} = require('../models/areas');
const appFlow = require('debug')('app:flow');
const appFlowUser = require('debug')('app:flowUser');
const appHistory = require('debug')('app:History');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment');

/***********/
/* Flow    */
/**********/

//'BUSCAR TODOS LOS RADICADOS DE UN USUARIO' GET Method
router.get('/:id', async (req, res) => {
    try{
        
        const flow = await Flow.find({"user": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        

        const response = [];
        i = flow.length;
        p = i - 1 ;
        while ( i > 0){
            const findRecord = await Records.find({"_id": flow[p].record});
            appFlow('#' + flow[0] + '#');
            if (!findRecord || findRecord.length == 0) return res.send([]); // Error 404
            
            let typification = await Typifications.findById(findRecord[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(findRecord[0].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            const light = await Lights.findOne({"name": 'CASO'});
            if (!light) return res.status(404).send('Semaforo de casos no encontrado'); // Error 404 

            const lightUser = await Lights.findOne({"name": 'USUARIO'});
            if (!lightUser) return res.status(404).send('Semaforo de usuario no encontrado'); // Error 404 
           
            //Verificar el estado del semaforo del caso
                const creation =  findRecord[0].date;
                const now = moment()
                const then = findRecord[0].caseFinDate;
                let  caseLight = 50; //Por Defecto el semaforo es amarillo

                const result = moment(now).isBefore(then);
                
            
                if(result) {
                    appFlow('Radicado aun con tiempo.');
                    appFlow('/* Creado: ' + creation );
                    appFlow('/* Finaliza: ' + then);
                    appFlow('*/ Hoy: ' + now.format('YYYY-MM-DD HH:mm') );
                    const totalTime = await diffDate(creation, then);
                    const currentTime = await diffDate(now, then);
                    appFlow('Diferencia Total'); 
                    appFlow(totalTime);
                    appFlow('Diferencia Actual');
                    appFlow(currentTime);
                    
                    const totalHours = (totalTime.days * 24) + totalTime.hours + (totalTime.minutes/60);
                    const currentHours = (currentTime.days * 24) + currentTime.hours + (currentTime.minutes/60);

                    const percent = (currentHours/totalHours) * 100;
                    appFlow('Porcentaje: ' + percent);
                    if (percent <= light.red) caseLight = 0;
                    if (percent >= light.green) caseLight = 100;
                    appFlow('Semaforo: ' + caseLight);
                    //Falta Actualizar los tiempos en el radicado
                }
                if(!result) appFlow('Radicado Vencido.')
                if(!result) caseLight = 0;
            
            //Verificar el estado del semaforo del usuario
                appFlow('##' + flow[p] + '##');

                const creationUser =  findRecord[0].date;
                const nowUser = moment()
                const thenUser = flow[p].finDate;
              
                let  userLight = 50; //Por Defecto el semaforo es amarillo

                const resultUser = moment(nowUser).isBefore(thenUser);
                if(result) {
                    appFlowUser('Usuario aun con tiempo.');
                    appFlowUser('/* Creado: ' + creationUser );
                    appFlowUser('/* Finaliza: ' + thenUser);
                    appFlowUser('*/ Hoy: ' + nowUser.format('YYYY-MM-DD HH:mm') );
                    const totalTimeUser = await diffDate(creationUser, thenUser);
                    const currentTimeUser = await diffDate(nowUser, thenUser);
                    appFlowUser('Diferencia Total'); 
                    appFlowUser(totalTimeUser);
                    appFlowUser('Diferencia Actual');
                    appFlowUser(currentTimeUser);
                    
                    const totalHoursUser = (totalTimeUser.days * 24) + totalTimeUser.hours + (totalTimeUser.minutes/60);
                    const currentHoursUser = (currentTimeUser.days * 24) + currentTimeUser.hours + (currentTimeUser.minutes/60);

                    const percentUser = (currentHoursUser/totalHoursUser) * 100;
                    appFlowUser('Porcentaje: ' + percentUser);
                    if (percentUser <= lightUser.red) userLight = 0;
                    if (percentUser >= lightUser.green) userLight = 100;
                    appFlowUser('Semaforo: ' + userLight);
                    //Falta Actualizar los tiempos en el radicado
                }
                if(!resultUser) appFlowUser('Radicado Vencido.')
                if(!resultUser) userLight = 0;
            
                const caseType = flow[p].case;
                
            const record = { 
                _id: findRecord[0]._id,
                number: findRecord[0].number,
                customer: findRecord[0].customer,
                ref: findRecord[0].ref,
                userLight: userLight,
                caseLight: caseLight,
                typification: typification.name,
                child: child.name,
                date: findRecord[0].date,
                userFinDate: thenUser,
                case: caseType
            };

            response.push(record);
            i = i - 1;
            p = p - 1;
        }

        res.send(response);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'BUSCAR TODOS LOS RADICADOS DE UN USUARIO' GET Method
router.get('/close/:id', async (req, res) => {
    try{
        
        const flow = await Flow.find({"user": req.params.id, "status": false, "case":4 });
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
     
        const response = [];
        let i = flow.length;
        let p = i - 1 ;
        while ( i > 0){
            const findRecord = await Records.find({"_id": flow[p].record});
            if (!findRecord || findRecord.length == 0) return res.send([]); // Error 404 
            
            let typification = await Typifications.findById(findRecord[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(findRecord[0].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            const light = await Lights.findOne({"name": 'CASO'});
            if (!light) return res.status(404).send('Semaforo de casos no encontrado'); // Error 404 

            const lightUser = await Lights.findOne({"name": 'USUARIO'});
            if (!lightUser) return res.status(404).send('Semaforo de usuario no encontrado'); // Error 404 
           
            const record = { 
                _id: findRecord[0]._id,
                number: findRecord[0].number,
                customer: findRecord[0].customer,
                ref: findRecord[0].ref,
                userLight: flow[p].light,
                caseLight: findRecord[0].caseLight,
                typification: typification.name,
                child: child.name,
                date: findRecord[0].date,
                caseUserDate: findRecord[0].caseFinDate
            };

            response.push(record);
            i = i - 1;
            p = p - 1;
        }

        res.send(response);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'BUSCAR UN RADICADO ESPECIFICO' GET Method
router.get('/flow/:id', async (req, res) => {
    try{
        const result = {}
        const records = await Records.find({"_id": req.params.id});
        if (!records || records.length == 0) return res.status(404).send('No se encuentran Radicados.'); // Error 404 
         
        let query = {}
        if(records[0].status == false) query = {"record": req.params.id, "status": true};
        if(records[0].status === true) query ={"record": req.params.id, "status": false, "case":4 };
          
    
        const flow = await Flow.find(query);
        if (!flow || flow.length == 0) return res.status(404).send('Flujo no encontrado'); // Error 404 
        
        let typification = await Typifications.findById(records[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
        let child = await ChildTypifications.findById(records[0].child);
        if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
        
        let channel = await Channels.findById(records[0].channel);
        if (!channel || channel.length == 0) return res.status(404).send('No se encontro una canal de comunicaciones.'); // Error 404 
        
        let contact = await Contacts.findById(records[0].contact);
        if (!contact || contact.length == 0) return res.status(404).send('No se encontro un contacto.'); // Error 404 
        
        let i = flow.length;
        let p = i - 1;
        while ( i > 0){
            let user = await Users.findById(flow[p].user);
            if (!user || user.length == 0) return res.status(404).send('No se encontro el usuario.'); // Error 404 
          
            flow[p].user = user.name;
            i = i - 1;
            p = p - 1;
        }
     
       
        //const customer = records[0].customer;
        //Buscar Nombre en Customer
        //records[0].contact = contact.name;
        result.customer =  records[0].customer;

        if (records[0].customerName) {
            result.customerName = records[0].customerName;
        } else{
            const searchName = await Customer.findOne({id: result.customer});
            if (searchName){
                const updateName = await Records.findByIdAndUpdate(records[0]._id, {
                    customerName: searchName.name
                },{
                    new: true
                });
                result.customerName = searchName.name;
            }
            else{
                result.customerName = "Nombre del cliente no encontrado";
            }
        }

        records[0].typification = typification.name;
        records[0].child = child.name;
        records[0].channel = channel.name;
        records[0].contact = contact.name;

        result.records = records;
        
        result.flow = flow;

        //Usuario actual en la tipificaión si se quiere reasignar.
        const currentLevel = flow[0].level
        let currentUser = 0;
        if(currentLevel < 0 ) currentUser =  records[0].createdBy;
        if(currentLevel >= 0 ) currentUser =  child.levels[currentLevel].user;
        let user = await Users.findById(currentUser);
        if (!user || user.length == 0) return res.status(404).send('No se encontro el usuario.'); // Error 404 
        
        const reassing = {};
        reassing.userId = user._id;
        reassing.user   = user.name;
       
        result.reassing = reassing;

        res.send(result);

    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});



//Historial de Radicados
router.get('/history/:id', async (req , res)  => {
    const flow = await Flow.find({"record": req.params.id});
    if (!flow) return res.status(404).send('Flujo no encontrado'); // Error 404 
    let i = flow.length;
        let p = i - 1;
        while ( i > 0){
            let user = await Users.findById(flow[p].user);
            if (!user || user.length == 0) return res.status(404).send('No se encontro el usuario.'); // Error 404 
            if (flow[p].level < 0) flow[p].level = 0; //Para que no salga un -1
            flow[p].user = user.name;
            i = i - 1;
            p = p - 1;
        }
    res.send(flow);
});

//Guardo el estado del flujo
router.post('/flow/:id', async(req, res) =>{

    try{
        const { error } = validateFlow(req.body);
        //if (error) return res.status(400).send(error.details[0].message);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);
        
        //Los casos estan "quemados" ver case.js si se mofican cambiaria la logica
        let flow = null;
        if (req.body.case == 1)  flow = await backFlow(req); //'Rechazar - Devolver'
        if (req.body.case == 2)  flow = await nextFlow(req); //'Finalizar -Avanzar'
        if (req.body.case == 3)  flow = await changeFlow(req); //'En Gestión'
        if (req.body.case == 4)  flow = await closeFlow(req); //'Cerrar Caso'
        if (req.body.case == 5)  flow = await changeFlow(req); //'Abierto'
        if (req.body.case == 6)  flow = await assingFlow(req); //'Reasignar Caso'
        if (req.body.case > 6)  return res.status(400).send('Gestión de caso no encontrado'); 
        if (flow.ERROR) return res.status(400).send(flow);
        
        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//*****************//
//*** Reportes ***//
//****************//

//Generar Casos Cerrados
router.post('/report/:id', async (req, res) => {
    try {
        
        const flow = await Flow.find({"user": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        

        const response = [];
        i = flow.length;
        p = i - 1 ;
        while ( i > 0){
            const findRecord = await Records.find({"_id": flow[p].record});
           
            if (!findRecord || findRecord.length == 0) return res.send([]); // Error 404
            
            let typification = await Typifications.findById(findRecord[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(findRecord[0].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            const light = await Lights.findOne({"name": 'CASO'});
            if (!light) return res.status(404).send('Semaforo de casos no encontrado'); // Error 404 

            const lightUser = await Lights.findOne({"name": 'USUARIO'});
            if (!lightUser) return res.status(404).send('Semaforo de usuario no encontrado'); // Error 404 
           
            //Verificar el estado del semaforo del caso
                const creation =  findRecord[0].date;
                const now = moment()
                const then = findRecord[0].caseFinDate;
                let  caseLight = 50; //Por Defecto el semaforo es amarillo

                const result = moment(now).isBefore(then);
                
            
                if(result) {
                   
                    const totalTime = await diffDate(creation, then);
                    const currentTime = await diffDate(now, then);
                   
                    
                    const totalHours = (totalTime.days * 24) + totalTime.hours + (totalTime.minutes/60);
                    const currentHours = (currentTime.days * 24) + currentTime.hours + (currentTime.minutes/60);

                    const percent = (currentHours/totalHours) * 100;
                   
                    if (percent <= light.red) caseLight = 0;
                    if (percent >= light.green) caseLight = 100;
                    
                    //Falta Actualizar los tiempos en el radicado
                }
                
                if(!result) caseLight = 0;
            
            //Verificar el estado del semaforo del usuario
                
                const creationUser =  findRecord[0].date;
                const nowUser = moment()
                const thenUser = flow[p].finDate;
              
                let  userLight = 50; //Por Defecto el semaforo es amarillo

                const resultUser = moment(nowUser).isBefore(thenUser);
                if(result) {
                   
                    const totalTimeUser = await diffDate(creationUser, thenUser);
                    const currentTimeUser = await diffDate(nowUser, thenUser);
                   
                    
                    const totalHoursUser = (totalTimeUser.days * 24) + totalTimeUser.hours + (totalTimeUser.minutes/60);
                    const currentHoursUser = (currentTimeUser.days * 24) + currentTimeUser.hours + (currentTimeUser.minutes/60);

                    const percentUser = (currentHoursUser/totalHoursUser) * 100;
                   
                    if (percentUser <= lightUser.red) userLight = 0;
                    if (percentUser >= lightUser.green) userLight = 100;
                   
                    //Falta Actualizar los tiempos en el radicado
                }
               
                if(!resultUser) userLight = 0;
            
                const caseType = flow[p].case;
                
            const record = { 
                RADICADO: findRecord[0].number,
                CLIENTE: findRecord[0].customer,
                CREDITO: findRecord[0].ref,
                SEMAFORO_CASO: caseLight,
                SEMAFORO_USUARIO: userLight,
                TIPIFICACION: typification.name,
                TIPIFICACION_ESPECIFICA: child.name,
                FECHA: findRecord[0].date,
                VENCIMINETO: thenUser,
                CASO: caseType
            };

            response.push(record);
            i = i - 1;
            p = p - 1;
        }
        
        if(!response.length) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
        
    
        const random = randomstring.generate(8);
        const name = 'Close' + random
        const fileName = './downloads/' + name + '.csv';

        jsonexport(response,function(err, csv){
            if(err) return appReport(err);
           
            fs.writeFile(fileName, csv, function (err) {
                if (err) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
                    appReport('Saved!');
                    res.send({ 'file': name});
                });
        });
        
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'Casos Abiertos tomar el archivo y borrarlo
router.get('/report/:file', async (req, res) => {
    try { 
        if (!req.params.file) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
        const fileName =  './downloads/' + req.params.file + '.csv';
            //Creamos un Stream para seguir el archivo y luego borrarlo
            let file = fs.createReadStream(fileName);
            res.download(fileName, 'radicados_cerrados.csv');
            //Cuando se termine de bajar lo borramos
            file.on('end', function() {
              fs.unlink(fileName, function() {
                // file deleted
                appReport('Deleted!');
              });
            });
            file.pipe(res);
     
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

module.exports = router;
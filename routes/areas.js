const auth = require('../middleware/auth');
const {Areas, validate} = require('../models/areas');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio


/**********/
/* Areas */
/*********/

//'BUSCAR AREAS' GET Method
router.get('/', auth, async (req, res) => {
    const areas = await Areas.find().sort('areas');
    res.send(areas);
});

//'BUSCAR UN AREA ESPECIFICA' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Buscar un  caso especifico
        //Si no existe, return 404 - Not Found
        const area = await Areas.findById(req.params.id);
        if (!area) return res.status(404).send('Area no encontrada'); // Error 404 
        res.send(area);
    }
    catch (ex){
        res.status(500).send({'Error':'Algo salio mal :( [Areas]'})
    }
});

//'CREAR AREA' POST Method
router.post('/', auth, async (req, res) => {

   try {//Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    let area = new Areas({
        name: req.body.name,
        attention : { 
            mon: { 
                 check: req.body.attention.mon.check,
                 start: {
                    h: req.body.attention.mon.start.h,
                    m: req.body.attention.mon.start.m,
                 },
                 fin: {
                    h: req.body.attention.mon.fin.h,
                    m: req.body.attention.mon.fin.m,
                 }
            },
            tue: { 
                check: req.body.attention.tue.check,
                start: {
                   h: req.body.attention.tue.start.h,
                   m: req.body.attention.tue.start.m,
                },
                fin: {
                   h: req.body.attention.tue.fin.h,
                   m: req.body.attention.tue.fin.m,
                }
            },
            wed: { 
                check: req.body.attention.wed.check,
                start: {
                   h: req.body.attention.wed.start.h,
                   m: req.body.attention.wed.start.m,
                },
                fin: {
                   h: req.body.attention.wed.fin.h,
                   m: req.body.attention.wed.fin.m,
                }
            },
            thu: { 
                check: req.body.attention.thu.check,
                start: {
                   h: req.body.attention.thu.start.h,
                   m: req.body.attention.thu.start.m,
                },
                fin: {
                   h: req.body.attention.thu.fin.h,
                   m: req.body.attention.thu.fin.m,
                }
            },
            fri: { 
                check: req.body.attention.fri.check,
                start: {
                   h: req.body.attention.fri.start.h,
                   m: req.body.attention.fri.start.m,
                },
                fin: {
                   h: req.body.attention.fri.fin.h,
                   m: req.body.attention.fri.fin.m,
                }
            },
            sat: { 
                check: req.body.attention.sat.check,
                start: {
                   h: req.body.attention.sat.start.h,
                   m: req.body.attention.sat.start.m,
                },
                fin: {
                   h: req.body.attention.sat.fin.h,
                   m: req.body.attention.sat.fin.m,
                }
            },
            sun: { 
                check: req.body.attention.sun.check,
                start: {
                   h: req.body.attention.sun.start.h,
                   m: req.body.attention.sun.start.m,
                },
                fin: {
                   h: req.body.attention.sun.fin.h,
                   m: req.body.attention.sun.fin.m,
                }
            }
        },
        leader: req.body.leader,
        email: req.body.email
    });
    area = await area.save();
    res.send(area);
}
    catch (ex){
        res.status(500).send(ex)
    }
});

//'MODIFICAR AREA' PUT Method
router.put('/:id', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const area = await Areas.findByIdAndUpdate(req.params.id, {
        name : req.body.name,
        name: req.body.name,
        attention : { 
            mon: { 
                 check: req.body.attention.mon.check,
                 start: {
                    h: req.body.attention.mon.start.h,
                    m: req.body.attention.mon.start.m,
                 },
                 fin: {
                    h: req.body.attention.mon.fin.h,
                    m: req.body.attention.mon.fin.m,
                 }
            },
            tue: { 
                check: req.body.attention.tue.check,
                start: {
                   h: req.body.attention.tue.start.h,
                   m: req.body.attention.tue.start.m,
                },
                fin: {
                   h: req.body.attention.tue.fin.h,
                   m: req.body.attention.tue.fin.m,
                }
            },
            wed: { 
                check: req.body.attention.wed.check,
                start: {
                   h: req.body.attention.wed.start.h,
                   m: req.body.attention.wed.start.m,
                },
                fin: {
                   h: req.body.attention.wed.fin.h,
                   m: req.body.attention.wed.fin.m,
                }
            },
            thu: { 
                check: req.body.attention.thu.check,
                start: {
                   h: req.body.attention.thu.start.h,
                   m: req.body.attention.thu.start.m,
                },
                fin: {
                   h: req.body.attention.thu.fin.h,
                   m: req.body.attention.thu.fin.m,
                }
            },
            fri: { 
                check: req.body.attention.fri.check,
                start: {
                   h: req.body.attention.fri.start.h,
                   m: req.body.attention.fri.start.m,
                },
                fin: {
                   h: req.body.attention.fri.fin.h,
                   m: req.body.attention.fri.fin.m,
                }
            },
            sat: { 
                check: req.body.attention.sat.check,
                start: {
                   h: req.body.attention.sat.start.h,
                   m: req.body.attention.sat.start.m,
                },
                fin: {
                   h: req.body.attention.sat.fin.h,
                   m: req.body.attention.sat.fin.m,
                }
            },
            sun: { 
                check: req.body.attention.sun.check,
                start: {
                   h: req.body.attention.sun.start.h,
                   m: req.body.attention.sun.start.m,
                },
                fin: {
                   h: req.body.attention.sun.fin.h,
                   m: req.body.attention.sun.fin.m,
                }
            }
        },
        leader : req.body.leader,
        email : req.body.email
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!area) return res.status(404).send('Area no encontrada'); // Error 404 
    //Return the updated course
    res.send(area);
});

module.exports = router;
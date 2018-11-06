const auth = require('../middleware/auth');
const {Holiday, validateHoliday} = require('../models/holidays');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

/*************/
/* Holidays */
/************/

//'BUSCAR Dias Festivos' GET Method
router.get('/',  async (req, res) => {
    try {
        const holidays = await Holiday.find().sort('date');
        res.send(holidays);
        }
    catch(ex){
            console.log(ex);
            res.status(500).send({ 'Error': 'Algo salio mal :('});
        }
});


//'BUSCAR UN Dias Festivos ESPECIFICO' GET Method
router.get('/:date',  async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const holiday = await Holiday.findOne({"date": req.params.date});
        if (!holiday) return res.status(404).send('Fecha no encontrada'); // Error 404 
        res.send(holiday);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'CREAR Dias Festivos' POST Method
router.post('/',  async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateHoliday(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let holiday = new Holiday({
        date: req.body.date
    });
   
    holiday = await holiday.save();
    res.send(holiday);

});

//'MODIFICAR Dias Festivos' PUT Method
router.put('/:id',  async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateHoliday(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const holiday = await Holiday.findByIdAndUpdate(req.params.id, {
        date: req.body.date
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!holiday) return res.status(404).send('Fecha no encontrada'); // Error 404 

    //Return the updated course
    res.send(holiday);
    
});

module.exports = router;
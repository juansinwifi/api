const Joi = require('joi'); //Validacion de Inputs en el servicio
const express = require('express');
const app = express();
app.use(express.json()); //Lee entradas en formato json


/* DENTIX API */

/* MANAGMENT SECTION */

//'REQUERIMIENTOS' POST Method  

app.post('/api/admin/requirements', (req, res) => {
    // Recibir Tipo, SMS (Si/No), Respuesta (Si/No), Medio (Email/Fisico)
    // Tiempos (Inmediato, Apertura, Seguimiento), dias u horas. 
    const schema = {
        type: Joi.string().min(3).required(),
        sms: Joi.boolean().required(),
        written: Joi.boolean().required(),
        medium: Joi.string().min(3).required(),
        times: Joi.string().min(3).required(),
        days: Joi.number().integer().required()

    };

    const result = Joi.validate(req.body, schema);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
    }

    const requirement = {
        type: req.body.type,
        sms: req.body.sms,
        written: req.body.written,
        medium: req.body.medium,
        times: req.body.times,
        days: req.body.days
    };
    //customers.push(customer);
    res.send(requirement);
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
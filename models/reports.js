const Joi = require('joi');


//Funcion de Validación de Campos de Gestuón de Casos
function validateReport(requiement) {

    const schema = {
       iniDate: Joi.date().required(),
       finDate: Joi.date().required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.validateReport = validateReport;
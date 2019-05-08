const mongoose = require('mongoose');
const Joi = require('joi');
const reportsSchema = new mongoose.Schema({

        RADICADO: { type: String},
        CLIENTE: { type: String},
        CREDITO:{ type: String},
        CREADO: { type: String},
        RADICADOR: { type: String},
        FINALIZADOR: { type: String},
        SEMAFORO_USUARIO: { type: String},
        SEMAFORO_CASO: { type: String},
        TIPIFICACION: { type: String},
        TIPIFICACION_ESPECIFICA: { type: String},
        PQR: { type: String},
        VENCIMIENTO_USUARIO: { type: String},
        VENCIMIENTO_CASO: { type: String},
        FECHA_SEGUIMIENTO: { type: String},
        ULTIMO_INGREO_RADICADOR: { type: String},
        FECHA_CIERRE: { type: String},
        TIPO_GESTION: { type: String},
        CAUSAL_RECHAZO: { type: String},
        OBSERVACIONES: { type: String},
        FORMULARIOS: { type: String}

});

const Reports =  mongoose.model('Reports', reportsSchema);

const opensSchema = new mongoose.Schema({

    RADICADO: { type: String},
    CLIENTE: { type: String},
    CREDITO:{ type: String},
    CREADO: { type: String},
    RADICADOR: { type: String},
    FINALIZADOR: { type: String},
    SEMAFORO_USUARIO: { type: String},
    SEMAFORO_CASO: { type: String},
    TIPIFICACION: { type: String},
    TIPIFICACION_ESPECIFICA: { type: String},
    PQR: { type: String},
    VENCIMIENTO_USUARIO: { type: String},
    VENCIMIENTO_CASO: { type: String},
    FECHA_SEGUIMIENTO: { type: String},
    ULTIMO_INGREO_RADICADOR: { type: String},
    TIPO_GESTION: { type: String},
    CAUSAL_RECHAZO: { type: String},
    OBSERVACIONES: { type: String},
    FORMULARIOS: { type: String}

});

const Opens =  mongoose.model('Opens', opensSchema);

//Funcion de Validación de Campos de Gestuón de Casos
function validateReport(requiement) {

    const schema = {
       iniDate: Joi.date().required(),
       finDate: Joi.date().required()
    };

    return Joi.validate(requiement, schema);
}

module.exports.Reports = Reports;
module.exports.Opens = Opens;
module.exports.validateReport = validateReport;
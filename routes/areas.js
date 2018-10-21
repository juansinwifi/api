const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio


/**********/
/* Areas */
/*********/

const areas = [{
    id: 1,
    name: "OPERACIONES",
    attention: {
        mon: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        tue: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        wed: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        thu: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        fri: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        sat: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
        sun: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
    },
    leader: "Pedro Ficticio",
    email: "pficticio@dentix.com"
},
{
    id: 2,
    name: "CLINICA  CALLE 90",
    attention: {
        mon: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        tue: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        wed: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        thu: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        fri: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
        sat: { check: true, start: { h: 8, m: 0 }, fin: { h: 12, m: 0 } },
        sun: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
    },
    leader: "Juan Perez",
    email: "jperez@dentix.com"
}
];

//'BUSCAR AREAS' GET Method
router.get('/', auth, (req, res) => {
res.send(areas);
});

//'BUSCAR UN AREA ESPECIFICA' GET Method
router.get('/:id', auth, (req, res) => {
//Look up the requierement
//If not existing, return 404 - Not Found
const area = areas.find(a => a.id === parseInt(req.params.id));
if (!area) return res.status(404).send('Area no encontrada'); // Error 404 
res.send(area);
});

//'CREAR AREA' POST Method
router.post('/areas', auth, (req, res) => {
//Validate Data
//If invalid, return 404 - Bad Request
const { error } = validateArea(req.body);
//if (error) return res.status(400).send(error.details[0].message);
if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

const area = {
    id: areas.length + 1,
    name: req.body.name,
    attention: {
        mon: { check: req.body.attention.mon.check, start: req.body.attention.start, fin: req.body.attention.fin },
        tue: { check: req.body.attention.tue.check, start: req.body.attention.start, fin: req.body.attention.fin },
        wed: { check: req.body.attention.wed.check, start: req.body.attention.start, fin: req.body.attention.fin },
        thu: { check: req.body.attention.thu.check, start: req.body.attention.start, fin: req.body.attention.fin },
        fri: { check: req.body.attention.fri.check, start: req.body.attention.start, fin: req.body.attention.fin },
        sat: { check: req.body.attention.sat.check, start: req.body.attention.start, fin: req.body.attention.fin },
        sun: { check: req.body.attention.sun.check, start: req.body.attention.start, fin: req.body.attention.fin }
    },
    leader: req.body.leader,
    email: req.body.email
};
areas.push(area);
res.send(area);
});

//'MODIFICAR AREA' PUT Method
router.put('/:id', auth, (req, res) => {
//Look up the requierement
//If not existing, return 404 - Not Found
const area = areas.find(a => a.id === parseInt(req.params.id));
if (!area) return res.status(404).send('Area no encontrada'); // Error 404 

//Validate
//If invalid, return 404 - Bad Request
const { error } = validateArea(req.body);
if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

//Update AREA
area.name = req.body.name;
area.attention.mon.check = req.body.attention.mon.check;
area.attention.mon.start = req.body.attention.mon.start;
area.attention.mon.fin = req.body.attention.mon.fin;
area.attention.tue.check = req.body.attention.tue.check;
area.attention.tue.start = req.body.attention.tue.start;
area.attention.tue.fin = req.body.attention.tue.fin;
area.attention.wed.check = req.body.attention.wed.check;
area.attention.wed.start = req.body.attention.wed.start;
area.attention.wed.fin = req.body.attention.wed.fin;
area.attention.thu.check = req.body.attention.thu.check;
area.attention.thu.start = req.body.attention.thu.start;
area.attention.thu.fin = req.body.attention.thu.fin;
area.attention.fri.check = req.body.attention.fri.check;
area.attention.fri.start = req.body.attention.fri.start;
area.attention.fri.fin = req.body.attention.fri.fin;
area.attention.sat.check = req.body.attention.sat.check;
area.attention.sat.start = req.body.attention.sat.start;
area.attention.sat.fin = req.body.attention.sat.fin;
area.attention.sun.check = req.body.attention.sun.check;
area.attention.sun.start = req.body.attention.sun.start;
area.attention.sun.fin = req.body.attention.sun.fin;
area.leader = req.body.leader;
area.email = req.body.email;

//Return the updated course
res.send(area);
});

//Funcion de Validación de Campos del Area
function validateArea(requiement) {

const schema = {
    name: Joi.string().min(3).required(),
    attention: Joi.object().required().keys({
        mon: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        tue: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        wed: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        thu: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        fri: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        sat: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        }),
        sun: Joi.object().required().keys({
            check: Joi.boolean().required(),
            start: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            }),
            fin: Joi.object().required().keys({
                h: Joi.number().max(24).required(),
                m: Joi.number().max(60).required()
            })
        })
    }),
    leader: Joi.string().min(3).required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
};

return Joi.validate(requiement, schema);
}


module.exports = router;
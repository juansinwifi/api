const mongoose = require('mongoose');
const Joi = require('joi');

const areasSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        uppercase: true,
        unique: true
    },
    attention: {
        mon: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        tue: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        wed: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        thu:{ 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        fri: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        sat: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            },
        sun: { 
            check: {
                type: Boolean,
                required: true
            },
             start: {
                  h: {
                      type: Number,
                      required: true
                  }, 
                  m: {
                    type: Number,
                    required: true
                } }, 
            fin: { 
                h: {
                    type: Number,
                    required: true
                }, 
                m: {
                  type: Number,
                  required: true
              } } 
            }
    },
    leader: {
        type: String,
        uppercase: true
    },
    email: {
        type: String
    }
});

const Areas =  mongoose.model('Areas', areasSchema);

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

module.exports.Areas = Areas;
module.exports.validate = validateArea;

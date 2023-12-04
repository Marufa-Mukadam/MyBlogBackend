
import Joi from "joi"

export const blogValidation = Joi.object({
    
    post_id: Joi.number(), 
    title: Joi.string().required().min(2).max(256),
    description: Joi.string().min(8),
    category:Joi.string().min(3).allow('',null),
    img:Joi.string().allow('',null),
    date:Joi.string(),
    other_category:Joi.string().allow('',null),
    category_id:Joi.string().allow('',null)
  });


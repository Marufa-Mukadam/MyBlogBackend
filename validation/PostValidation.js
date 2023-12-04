
import Joi from "joi"

export const blogValidation = Joi.object({
    //removed this bcz it was giving problem while adding blog
    // post_id: Joi.number().required(), 
    title: Joi.string().required().min(2).max(256),
    description: Joi.string().min(8),
    category:Joi.string().required().min(3),
    img:Joi.string().allow('',null),
    date:Joi.string(),
    other_category:Joi.string().allow('',null)
  });


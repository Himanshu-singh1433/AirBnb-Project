const Joi = require("joi");
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      filename: Joi.string().allow("", null),
      url: Joi.string().allow("", null),
    }),
    price: Joi.number().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
  }).required(),
});

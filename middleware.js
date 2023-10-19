"use strict";

const { BadRequestError } = require("./expressError");

/**
 * If the request body is empty, throw a BadRequestError.
 */
function checkEmptyBody(req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError("Must include JSON body");
  }
  next();
}

module.exports = {
  checkEmptyBody,
}
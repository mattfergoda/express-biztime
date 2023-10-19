"use strict";
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { checkEmptyBody } = require("../middleware");

const db = require("../db");
const router = new express.Router();


/** Get companies
*   Returns {companies: [company, company, ...] }
*   Where company = {code, name, description}
*/
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
			FROM companies;`);
  console.log(results);
  const companies = results.rows;
  return res.json({ companies });
});

/**
*	Takes in company name as a URL parameter
*  Queries the database for companies matching that name
*  Returns JSON like { company: {code, name, description} }
*/
router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
			FROM companies
			WHERE code = $1`, [code]);

  const company = results.rows[0];
  if (!company) throw new NotFoundError(`Not found: ${code}`);
  return res.json({ company });
});

/**
 * Takes in request body containing info for one company
 * like {code, name, description}.
 * Inserts that company into the database
 *
 * Returns JSON like { company }
 * where company = {code, name, description}
 */
router.post("/", checkEmptyBody, async function (req, res, next) {
  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies ( code ,name , description)
			 VALUES ($1, $2, $3)
			 RETURNING code , name , description
			 `, [code, name, description]);

  const company = results.rows[0];

  return res
    .status(201)
    .json({ company });
});

/**
 * Takes in company code as a URL param and JSON body
 * like {name [optional], description [optional]}
 * Fully replaces the company with that code in the DB
 * Returns JSON of the updated object like { company }
 * where company = {code, name, description}
 */
router.put("/:code", checkEmptyBody, async function (req, res, next) {
  const code = req.params.code;
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
        SET name=$2,
          description=$3
        WHERE code = $1
        RETURNING code, name, description`,
    [code, name, description],
  );

  const company = result.rows[0];
  if (!company) throw new NotFoundError(`Not found: ${code}`);
  return res.json({ user: company });
});

/** Delete user, returning {status: "Deleted"}*/
router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;

  const result = await db.query(
    `DELETE
      FROM companies
      WHERE code = $1
      RETURNING code, name, description`,
    [code],
  );

  const company = result.rows[0];
  if (!company) throw new NotFoundError(`Not found: ${code}`);

  return res.json({ status: "deleted" });
});


module.exports = router;
"use strict";
const express = require("express");
const { BadRequestError } = require("../expressError");

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
*	Takes in company name as a query parameter
	Queries the database for companies matching that name
	Returns JSON like { company }
*/
router.get("/:name", async function (req, res, next) {
	const name = req.params.name;
	const results = await db.query(
		`SELECT code, name, description
			FROM companies
			WHERE name = $1`, [name]);
	const company = results.rows[0];
	return res.json({ company });
});

/**
 * Takes in request body containing info for one company
 * Inserts that company into the database
 * Returns JSON like { company }
 */
router.post("/", checkEmptyBody, async function (req, res, next) {
	const { code, name, description } = req.body;
	const results = await db.query(
		`INSERT INTO companies ( code ,name , description)
			 VALUES ($1, $2, $3)
			 RETURNING (code , name , description)
			 `, [code, name, description]);
	const company = results.rows[0];
	return res
		.status(201)
		.json({ company });
});

/**
 * Takes in company code as a URL param
 * Fully replaces the company with that code in the DB
 * Returns JSON of the updated object like { company }
 */
router.put("/:code", checkEmptyBody, async function (req, res, next) {
		const code = req.params.code;
		const { name, description } = req.body;


})



function checkEmptyBody(req, res, next) {
	if (req.body === "undefined") {
		throw new BadRequestError("Must include JSON body");
	}
	next();
}


module.exports = router;
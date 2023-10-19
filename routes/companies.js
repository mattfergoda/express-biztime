const express = require("express");

const db = require("../db");
const router = new express.Router();

/** Get companies
*   Returns {companies: [company, company, ...] }
*   Where company = {code, name, description}
*/

router.get("/", async function(req, res, next){
	const results = await db.query(
		`SELECT code, name, description
			FROM companies;`);
	console.log(results);
	const companies = results.rows;
	return res.json({ companies });
});


module.exports = router;
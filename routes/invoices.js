"use strict";
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { checkEmptyBody } = require("../middleware");

const db = require("../db");
const router = new express.Router();

/** Get invoices
*   Returns {invoices: [invoice, invoice, ...] }
*   Where invoice = {id, comp_code}
*/
router.get("/", async function (req, res, next) {

  const results = await db.query(
    `SELECT id, comp_code
			FROM invoices;`);

  const invoices = results.rows;

  return res.json({ invoices });
});

/**
*	Takes in invoice id as a URL parameter
*  Queries the database for invoices matching that id
*  Returns JSON like {invoice: {id, amt, paid, add_date, paid_date,
                      company: {code, name, description}}
*/
router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
			FROM invoices
			WHERE id = $1`, [id]);

  const invoice = invoiceResults.rows[0];
  if (!invoice) throw new NotFoundError(`No invoice with ID ${id}`);

  const compCode = invoice.comp_code;

  const companyResults = await db.query(
    `SELECT code, name, description
       FROM companies
       WHERE code = $1`, [compCode]
  );

  const company = companyResults.rows[0];
  // if (!company) throw new NotFoundError(`Company not found for ${invoice}`);

  invoice.company = company;
  delete invoice.comp_code;
  return res.json({ invoice });
});

/**
 * Takes in request body containing info for one invoice
 * like {comp_code, amt}.
 * Inserts that invoice into the database
 *
 * Returns JSON like { invoice }
 * where invoice = {id, comp_code, amt, paid, add_date, paid_date}
 */
router.post("/", checkEmptyBody, async function (req, res, next) {
  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code , amt)
			 VALUES ($1, $2)
			 RETURNING id, comp_code, amt, paid, add_date, paid_date
			 `, [comp_code, amt]);

  const invoice = results.rows[0];

  return res
    .status(201)
    .json({ invoice });
});

/**
 * Takes in invoice id as a URL param and JSON body
 * like {amt}
 * Fully replaces the invoice with that id in the DB
 * Returns JSON of the updated object like { invoice }
 * where invoice = {id, comp_code, amt, paid, add_date, paid_date}
 */
router.put("/:id", checkEmptyBody, async function (req, res, next) {
  const id = req.params.id;
  const { amt } = req.body;

  if (isNaN(amt)) throw new BadRequestError(`${amt} is not a number`);

  const result = await db.query(
    `UPDATE invoices
        SET amt=$2
        WHERE id = $1
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [id, amt],
  );

  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError(`No invoice with ID ${id}`);
  return res.json({ invoice });
});

/** Delete invoice, returning {status: "deleted"}*/
router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  const result = await db.query(
    `DELETE
      FROM invoices
      WHERE id = $1
      RETURNING id`,
    [id],
  );

  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError(`No invoice with ID ${id}`);

  return res.json({ status: "deleted" });
});

module.exports = router;
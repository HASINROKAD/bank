const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const transactionRoutes = Router();

/**
 * - POST /api/transaction/
 * - Create a new transation
 */
transactionRoutes.post("/", authMiddleware.authMiddleware);

module.exports = transactionRoutes;

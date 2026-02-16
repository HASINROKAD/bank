const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * -Routes
 */

const authRouter = require("../src/routes/auth.routes");
const accountRouter = require("../src/routes/accounts.routes");

/**
 * - Use Routes
 */

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

module.exports = app;

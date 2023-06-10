const express = require("express");
const app = express();
const stockRoutes = require("./routes/stock-route");
const userRoutes = require("./routes/user-route");
const userTransactionRoutes = require("./routes/user-transaction-route");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "investment",
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
    return;
  }
  console.log("Connected to MySQL");
});
app.use(express.json());
app.use("/stocks", stockRoutes);
app.use("/users", userRoutes);
app.use("/user-transactions", userTransactionRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
module.exports = { connection, app };

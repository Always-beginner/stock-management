async function getAllStocks(req, res) {
  try {
    const connection = require("../server").connection;
    const query = "SELECT * FROM stocks";
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error retrieving stocks:", err);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving stocks" });
        return;
      }
      res.json(rows);
    });
  } catch (err) {
    console.error("Error retrieving stocks:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving stocks" });
  }
}
async function getStockById(req, res) {
  try {
    const connection = require("../server").connection;
    const query = `SELECT * FROM stocks WHERE stock_id = ${req.params.id}`;
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error retrieving stock:", err);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving stock" });
        return;
      }
      if (rows.length == 0) res.status(404).json({ error: "Stock not found" });
      res.json(rows);
    });
  } catch (err) {
    console.error("Error retrieving stock:", err);
    res.status(500).json({ error: "An error occurred while retrieving stock" });
  }
}
async function updateStock(req, res) {
  try {
    const connection = require("../server").connection;
    const id = req.params.id;
    const { symbol, quantity, price, buy, sell } = req.body;
    const currentDate = new Date().toISOString().slice(0, 10);
    const query = `UPDATE stocks SET symbol = '${symbol}', quantity = ${quantity}, price = ${price}, lastUpdate = '${currentDate}', buy = ${buy}, sell = ${sell} WHERE stock_id = ${id}`;
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error updating stock:", err);
        res
          .status(500)
          .json({ error: "An error occurred while updating stock" });
        return;
      }
      if (rows.affectedRows == 0)
        res.status(404).json({ error: "User not found" });
      res.json(rows);
    });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ error: "An error occurred while updating stock" });
  }
}
module.exports = {
  getAllStocks,
  getStockById,
  updateStock,
};

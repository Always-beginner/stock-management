async function getTransactionById(req, res) {
  try {
    const connection = require("../server").connection;
    const query = `SELECT * FROM user_transactions WHERE t_id = ${req.params.id}`;
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error retrieving Transaction:", err);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving Transaction" });
        return;
      }
      if (rows.length <= 0)
        res.status(404).json({ error: "Transaction not found" });
      else {
        res.json(rows);
      }
    });
  } catch (err) {
    console.error("Error retrieving Transaction:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving Transaction" });
  }
}
async function getAllTransaction(req, res) {
  try {
    const connection = require("../server").connection;
    const query = `SELECT * FROM user_transactions`;
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error retrieving Transaction:", err);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving Transaction" });
        return;
      }
      if (rows.length == 0)
        res.status(404).json({ error: "Transaction not found" });
      else {
        res.json(rows);
      }
    });
  } catch (err) {
    console.error("Error retrieving Transaction:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving Transaction" });
  }
}
async function buyTransaction(req, res) {
  try {
    const connection = require("../server").connection;
    const { stock_id, user_Id, quantity } = req.body;
    if (quantity >= 0) {
      await connection.query(
        `SELECT quantity,price,user_limit FROM stocks WHERE stock_id = ${stock_id}`,
        (err, rows) => {
          if (err) {
            res.status(500).json({ error: `Error retrieving Stock:${err}` });
          }
          stock_quantity = parseInt(rows[0].quantity);
          stock_price = parseInt(rows[0].price);
          user_limit = parseInt(rows[0].user_limit);
          stock_cap = Math.round((stock_quantity * user_limit) / 100);
          if (stock_quantity < quantity) {
            res.status(404).json({ error: "Insufficient Stocks" });
          }
          if (quantity > stock_cap) {
            res.status(404).json({
              error: `You are only eligible to buy equity with a ${user_limit}% investment.`,
            });
          } else {
            total_price = quantity * stock_price;
            connection.query(
              `SELECT balance,quantity FROM users WHERE user_id = ${user_Id}`,
              (err, rows) => {
                if (err) {
                  res
                    .status(500)
                    .json({ error: `Error retrieving User:${err}` });
                }
                user_balance = parseInt(rows[0].balance);
                user_quantity = parseInt(rows[0].quantity);
                if (user_balance < total_price) {
                  res.status(404).json({ error: "Insufficient Balance" });
                }
                user_quantity = user_quantity + quantity;
                user_balance = user_balance - total_price;
                connection.query(
                  `UPDATE users SET balance = ${user_balance}, quantity = ${user_quantity} WHERE user_id = ${user_Id}`,
                  (err, rows) => {
                    if (err) {
                      res
                        .status(500)
                        .json({ error: `Error retrieving User:${err}` });
                    }
                    if (rows.affectedRows == 0) {
                      res.status(404).json({ error: "Transaction Failed" });
                    } else if (rows.affectedRows == 1) {
                      percentage_buy = (
                        (quantity / stock_quantity) *
                        100
                      ).toFixed(2);
                      new_price = (
                        stock_price *
                        (1 + percentage_buy / 100)
                      ).toFixed(2);
                      new_quantity = stock_quantity - quantity;
                      connection.query(
                        `UPDATE stocks SET price = ${new_price}, quantity = ${new_quantity} WHERE stock_id = ${stock_id}`,
                        (err, rows) => {
                          if (err) {
                            res
                              .status(500)
                              .json({ error: `Error retrieving Stock:${err}` });
                          }
                          if (rows.affectedRows == 0)
                            res
                              .status(404)
                              .json({ error: "Transaction Failed" });
                          else if (rows.affectedRows == 1) {
                            const currentDate = new Date()
                              .toISOString()
                              .slice(0, 10);
                            const query = `INSERT INTO user_transactions (stock_id, user_Id, quantity, price,date,sell,buy) VALUES (${stock_id}, ${user_Id}, ${quantity}, ${new_price}, '${currentDate}', 0, 1)`;
                            connection.query(query, (err, rows) => {
                              if (err) {
                                console.error(
                                  "Error retrieving Transaction:",
                                  err
                                );
                                res
                                  .status(500)
                                  .json({ error: "Transaction Failed" });
                                return;
                              }
                              if (rows.affectedRows == 0)
                                res
                                  .status(404)
                                  .json({ error: "Transaction Failed" });
                              else if (rows.affectedRows == 1) {
                                connection.query(
                                  `SELECT * FROM user_stock WHERE user_id = ${user_Id}`,
                                  (err, rows) => {
                                    if (err) {
                                      res.status(500).json({
                                        error: "Error retrieving Transaction:",
                                      });
                                    }
                                    if (rows.length <= 0) {
                                      connection.query(
                                        `INSERT INTO user_stock (user_id,stock_id,quantity) VALUES (${user_Id},${stock_id},${quantity})`,
                                        (err, rows) => {
                                          if (err) {
                                            console.error(
                                              "Error retrieving User Stock:",
                                              err
                                            );
                                            res.status(500).json({
                                              error:
                                                "An error occurred while retrieving User Stock",
                                            });
                                            return;
                                          }
                                          if (rows.affectedRows == 0) {
                                            res.status(404).json({
                                              error: "Transaction Failed",
                                            });
                                          } else if (rows.affectedRows == 1) {
                                            res.json({
                                              message: "Transaction Successful",
                                            });
                                          }
                                        }
                                      );
                                    } else {
                                      connection.query(
                                        `SELECT * FROM user_stock WHERE user_id = ${user_Id} `,
                                        (err, rows) => {
                                          if (err) {
                                            res.status(500).json({
                                              error:
                                                "Error retrieving User Stock:",
                                            });
                                          }
                                          new_stock_id = rows
                                            .map((row) => {
                                              if (row.stock_id == stock_id) {
                                                return parseInt(row.stock_id);
                                              }
                                            })
                                            .find(
                                              (stock_id) =>
                                                stock_id !== undefined
                                            );
                                          new_stock_quantity = rows
                                            .map((row) => {
                                              if (row.stock_id == stock_id) {
                                                return parseInt(row.quantity);
                                              }
                                            })
                                            .find(
                                              (quantity) =>
                                                quantity !== undefined
                                            );
                                          console.log(
                                            new_stock_id,
                                            new_stock_quantity
                                          );
                                          if (new_stock_id == stock_id) {
                                            update_quantity =
                                              new_stock_quantity + quantity;
                                            connection.query(
                                              `UPDATE user_stock SET quantity = ${update_quantity} WHERE stock_id = ${stock_id}`,
                                              (err, rows) => {
                                                if (err) {
                                                  res.status(500).json({
                                                    error:
                                                      "Error retrieving User Stock:",
                                                  });
                                                }
                                                if (rows.affectedRows == 0) {
                                                  res.status(404).json({
                                                    error: "Transaction Failed",
                                                  });
                                                } else if (
                                                  rows.affectedRows == 1
                                                ) {
                                                  res.json({
                                                    message:
                                                      "Transaction Successful",
                                                  });
                                                }
                                              }
                                            );
                                          } else {
                                            connection.query(
                                              `INSERT INTO user_stock (user_id,stock_id,quantity) VALUES (${user_Id},${stock_id},${quantity})`,
                                              (err, rows) => {
                                                if (err) {
                                                  console.error(
                                                    "Error retrieving User Stock:",
                                                    err
                                                  );
                                                  res.status(500).json({
                                                    error:
                                                      "An error occurred while retrieving User Stock",
                                                  });
                                                  return;
                                                }
                                                if (rows.affectedRows == 0) {
                                                  res.status(404).json({
                                                    error: "Transaction Failed",
                                                  });
                                                } else if (
                                                  rows.affectedRows == 1
                                                ) {
                                                  res.json({
                                                    message:
                                                      "Transaction Successful",
                                                  });
                                                }
                                              }
                                            );
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            );
          }
        }
      );
    }
  } catch (err) {
    console.error("Error retrieving Transaction:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving Transaction" });
  }
}
async function sellTransaction(req, res) {
  try {
    const connection = require("../server").connection;
    const { stock_id, user_Id, quantity } = req.body;
    connection.query(
      `SELECT quantity FROM user_stock WHERE user_id = ${user_Id} AND stock_id = '${stock_id}'`,
      (err, rows) => {
        if (err) {
          res
            .status(500)
            .json({ error: "An error occurred while retrieving Transaction" });
        }
        user_stock_quantity = rows[0].quantity;
        if (quantity > user_stock_quantity) {
          res.status(404).json({ error: "Not enough stock" });
        }
        new_user_quantity = user_stock_quantity - quantity;
        if (quantity <= user_stock_quantity) {
          connection.query(
            `UPDATE user_stock SET quantity = ${new_user_quantity} WHERE user_id = ${user_Id} AND stock_id = '${stock_id}'`,
            (err, rows) => {
              if (err) {
                res.status(500).json({
                  error: "An error occurred while retrieving Transaction",
                });
              }
              if (rows.affectedRows == 0) {
                res.status(404).json({ error: "Transaction Failed" });
              }
            }
          );
        }
        connection.query(
          `SELECT * FROM stocks WHERE stock_id = '${stock_id}'`,
          (err, rows) => {
            if (err) {
              res.status(500).json({
                error: "An error occurred while retrieving Transaction",
              });
            }
            stock_price = rows[0].price;
            stock_quantity = rows[0].quantity;
            balance = stock_price * quantity;
            connection.query(
              `UPDATE users SET balance = balance + ${balance}`,
              (err, rows) => {
                if (err) {
                  res.status(500).json({
                    error: "An error occurred while retrieving Transaction",
                  });
                }
                if (rows.affectedRows == 0) {
                  res.status(404).json({ error: "Transaction Failed" });
                }
                const currentDate = new Date().toISOString().slice(0, 10);
                connection.query(
                  `INSERT INTO user_transactions (stock_id, user_Id, quantity, price,date,sell,buy) VALUES (${stock_id}, ${user_Id}, ${quantity}, ${stock_price}, '${currentDate}', 1,0)`,
                  (err, rows) => {
                    if (err) {
                      res.status(500).json({
                        error: "An error occurred while retrieving Transaction",
                      });
                    }
                    if (rows.affectedRows == 0) {
                      res.status(404).json({ error: "Transaction Failed" });
                    }
                  }
                );
              }
            );
            new_stock_quantity = stock_quantity + quantity;
            percentage_sell = ((quantity / stock_quantity) * 100).toFixed(2);
            new_stock_price = (
              stock_price *
              (1 - percentage_sell / 100)
            ).toFixed(2);
            const currentDate = new Date().toISOString().slice(0, 10);
            console.log(new_stock_quantity, new_stock_price, currentDate);
            connection.query(
              `UPDATE stocks SET quantity = ${new_stock_quantity}, price = ${new_stock_price},lastUpdate = '${currentDate}' WHERE stock_id = ${stock_id}`,
              (err, rows) => {
                if (err) {
                  res.status(500).json({
                    error: "An error occurred while retrieving Transaction",
                  });
                }
                if (rows.affectedRows == 0) {
                  res.status(404).json({ error: "Transaction Failed" });
                }
                if (rows.affectedRows == 1) {
                  res.json({ message: "Transaction Successful" });
                }
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error("Error retrieving Transaction:", err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving Transaction" });
  }
}
module.exports = {
  getTransactionById,
  getAllTransaction,
  buyTransaction,
  sellTransaction,
};

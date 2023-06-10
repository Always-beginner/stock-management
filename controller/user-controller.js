async function getUserById(req, res) {
  try {
    const connection = require("../server").connection;
    const query = `SELECT * FROM users WHERE user_id = ${req.params.id}`;
    connection.query(query, (err, rows) => {
      if (err) {
        console.error("Error retrieving user:", err);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving user" });
        return;
      }
      if (rows.length == 0) res.status(404).json({ error: "User not found" });
      res.json(rows);
    });
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ error: "An error occurred while retrieving user" });
  }
}
async function updateUser(req, res) {
  try {
    const connection = require("../server").connection;
    const id = req.params.id;
    const { name, email, balance, quantity } = req.body;
    const query = `UPDATE users SET name = '${name}', email = '${email}', balance = ${balance}, quantity = '${quantity}'WHERE user_id = ${id}`;
    connection.query(query, req.body, (err, rows) => {
      if (err) {
        console.error("Error updating user:", err);
        res
          .status(500)
          .json({ error: "An error occurred while updating user" });
        return;
      }
      if (rows.affectedRows == 0)
        res.status(404).json({ error: "User not found" });
      else {
        res.json(rows);
      }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "An error occurred while updating user" });
  }
}
module.exports = {
  getUserById,
  updateUser,
};

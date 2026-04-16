const pg = require('pg');
pg.types.setTypeParser(1082, (val) => val); 

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// INCREASE LIMIT: Essential for Base64 PDF strings
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({
  user: "michael",
  host: "localhost",
  database: "shiloh_trades",
  password: "michael12",
  port: 5432,
});

// --- TRADES ---
app.get("/api/trades", async (req, res) => {
  try {
    const result = await pool.query("SELECT buyer_name, amount_inr, order_id, usdt_rate, trade_date FROM trades ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/trades", async (req, res) => {
  try {
    const trades = req.body;
    for (let t of trades) {
      await pool.query(
        "INSERT INTO trades (buyer_name, amount_inr, order_id, usdt_rate, trade_date) VALUES ($1, $2, $3, $4, $5)",
        [t.buyerName, t.amountINR, t.orderId, t.usdtRate, t.date]
      );
    }
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: "Save Error" });
  }
});

// --- DOCUMENTS ---
app.get("/api/documents/:date", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents WHERE trade_date = $1", [req.params.date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const { id, name, type, file_type, data_url, trade_date } = req.body;
    // This now works because 'id' in DB is TEXT
    await pool.query(
      "INSERT INTO documents (id, name, type, file_type, data_url, trade_date) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, name, type, file_type, data_url, trade_date]
    );
    res.json({ message: "Uploaded" });
  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM documents WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://10.194.254.231:5000");
});

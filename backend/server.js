
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(function (err) {
  if (err) {
    console.log("MySQL connection error: " + err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});


// =========================
// HOME
// =========================

app.get("/", function (req, res) {
  res.send("VK EVENTS Backend is running!");
});


// =========================
// ADD BOOKING
// =========================

app.post("/api/bookings", function (req, res) {

  const name = req.body.name;
  const phone = req.body.phone;
  const event_type = req.body.event_type;
  const event_date = req.body.event_date;
  const location = req.body.location;
  const guests = req.body.guests;
  const message = req.body.message;

  if (
    !name ||
    !phone ||
    !event_type ||
    !event_date ||
    !location
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required booking fields."
    });
  }

  const sql = `
    INSERT INTO bookings
    (name, phone, event_type, event_date, location, guests, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    phone,
    event_type,
    event_date,
    location,
    guests || null,
    message || null
  ];

  db.query(sql, values, function (err, result) {

    if (err) {
      console.log(
        "Database error: " + err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to save booking."
      });
    }

    console.log(
      "New booking saved: " + result.insertId
    );

    return res.json({
      success: true,
      message: "Booking enquiry submitted successfully!",
      bookingId: result.insertId
    });

  });

});


// =========================
// GET BOOKINGS
// =========================

app.get("/api/bookings", function (req, res) {

  const sql = `
    SELECT *
    FROM bookings
    ORDER BY id DESC
  `;

  db.query(sql, function (err, results) {

    if (err) {
      console.log(
        "Bookings database error: " + err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load bookings."
      });
    }

    res.json({
      success: true,
      bookings: results
    });

  });

});


// =========================
// DELETE BOOKING
// =========================

app.delete("/api/bookings/:id", function (req, res) {

  const id = req.params.id;

  const sql = "DELETE FROM bookings WHERE id = ?";

  db.query(sql, [id], function (err, result) {

    if (err) {
      console.error(
        "Delete booking error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete booking."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    console.log(
      "Booking deleted: " + id
    );

    res.json({
      success: true,
      message: "Booking deleted successfully."
    });

  });

});


// =========================
// GET UPCOMING EVENTS
// =========================

app.get("/api/events", function (req, res) {

  const sql = `
    SELECT id, name, date, location, event_type
    FROM events
    WHERE date >= CURDATE()
    ORDER BY date ASC
  `;

  db.query(sql, function (err, results) {

    if (err) {
      console.log(
        "Events database error: " + err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load events."
      });
    }

    res.json({
      success: true,
      events: results
    });

  });

});
// =========================
// ADD EVENT
// =========================

app.post("/api/events", function (req, res) {

  const name = req.body.name;
  const date = req.body.date;
  const location = req.body.location;
  const event_type = req.body.event_type;

  if (!name || !date || !location || !event_type) {
    return res.status(400).json({
      success: false,
      message: "Please fill all event fields."
    });
  }

  const sql = `
    INSERT INTO events
    (name, date, location, event_type)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    name,
    date,
    location,
    event_type
  ];

  db.query(sql, values, function (err, result) {

    if (err) {
      console.log(
        "Add event database error: " + err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to add event."
      });
    }

    console.log(
      "New event added: " + result.insertId
    );

    res.json({
      success: true,
      message: "Event added successfully!",
      eventId: result.insertId
    });

  });

});

// =========================
// START SERVER
// =========================

const PORT = 5000;

app.listen(PORT, function () {
  console.log(
    "VK EVENTS Backend running on http://localhost:5000"
  );
});
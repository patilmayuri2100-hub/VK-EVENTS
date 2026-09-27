const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  has_secret: !!process.env.CLOUDINARY_API_SECRET
});
require('dotenv').config();

const app = express();
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
async function sendEmail(subject, message) {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject,
      text: message
    });

    console.log("Email notification sent successfully.");
  } catch (error) {
    console.log("Email notification error:", error.message);
  }
}
const uploadDir = path.join(__dirname, "uploads");
const videoUploadDir = path.join(__dirname, "uploads", "videos");
const galleryUploadDir = path.join(__dirname, "uploads", "gallery");

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// =========================
// GALLERY UPLOAD SETUP
// =========================
const upload = multer({
  storage: multer.memoryStorage()
});
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoUploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed."));
    }
  }
});
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  ssl: {
    minVersion: "TLSv1.2"
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  connectTimeout: 10000
});

db.query("SELECT 1", function (err) {
  if (err) {
    console.log("MySQL connection error:", err.message);
  } else {
    console.log("MySQL connected successfully!");
  }
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

app.post("/api/bookings", async function (req, res) {
  console.log("BOOKING ROUTE HIT");

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

  db.query(sql, values, async function (err, result) {

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
    console.log("ABOUT TO SEND BOOKING EMAIL");
   sendEmail(
  "New Event Booking - VK EVENTS",
  `New booking received.

Name: ${name}
Phone: ${phone}
Event Type: ${event_type}
Event Date: ${event_date}
Location: ${location}
Guests: ${guests}
Message: ${message || "No message provided"}`
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
// DELETE BOOKIN
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
// DELETE EVENT
// =========================

app.delete("/api/events/:id", function (req, res) {
  console.log("DELETE EVENT REQUEST RECEIVED:", req.params.id);

  const eventId = req.params.id;

  const sql = `
    DELETE FROM events
    WHERE id = ?
  `;

  db.query(sql, [eventId], function (err, result) {

    if (err) {
      console.log(
        "Delete event database error: " + err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete event."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    console.log(
      "Event deleted: " + eventId
    );

    res.json({
      success: true,
      message: "Event deleted successfully!"
    });

  });

});

// =========================
// EDIT EVENT
// =========================

app.put("/api/events/:id", function (req, res) {

  console.log("EDIT EVENT REQUEST RECEIVED:", req.params.id);
  console.log("EDIT EVENT DATA:", req.body);

  const eventId = req.params.id;

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
    UPDATE events
    SET name = ?,
        date = ?,
        location = ?,
        event_type = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      date,
      location,
      event_type,
      eventId
    ],
    function (err, result) {

      if (err) {

        console.log(
          "Edit event database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to edit event."
        });
      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: "Event not found."
        });
      }

      console.log(
        "Event updated:",
        eventId
      );

      res.json({
        success: true,
        message: "Event updated successfully!"
      });

    }
  );

});

// =========================
// GET GALLERY
// =========================

app.get("/api/gallery", function (req, res) {

  console.log("GET GALLERY REQUEST RECEIVED");

  const sql = `
    SELECT id, title, category, image
    FROM gallery
    ORDER BY id DESC
  `;

  db.query(sql, function (err, results) {

    if (err) {
      console.log(
        "Gallery fetch database error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch gallery."
      });
    }

    res.json({
      success: true,
      images: results
    });

  });

});
// =========================
// GALLERY UPLOAD
// =========================

app.post(
  "/api/gallery",
  upload.single("image"),
  function (req, res) {

    console.log("GALLERY UPLOAD REQUEST RECEIVED");

    const title = req.body.title;
    const category = req.body.category;

    if (!title || !category || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, category and image."
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vk-events/gallery"
      },
      function (error, result) {

if (error) {
  console.log("FULL CLOUDINARY ERROR:", JSON.stringify(error, null, 2));
  console.log("CLOUDINARY ERROR KEYS:", Object.keys(error));

  if (error.response) {
    console.log("CLOUDINARY RESPONSE:", error.response);
  }

  return res.status(500).json({
    success: false,
    message: "Failed to upload gallery image."
  });
}

        const image = result.secure_url;

        const sql = `
          INSERT INTO gallery
          (title, category, image)
          VALUES (?, ?, ?)
        `;

        db.query(
          sql,
          [title, category, image],
          function (err, dbResult) {

            if (err) {
              console.log(
                "Gallery upload database error:",
                err.message
              );

              return res.status(500).json({
                success: false,
                message: "Failed to save gallery image."
              });
            }

            console.log(
              "Gallery image uploaded:",
              dbResult.insertId
            );

            res.json({
              success: true,
              message: "Gallery image uploaded successfully!",
              id: dbResult.insertId,
              image: image
            });

          }
        );

      }
    );

    uploadStream.end(req.file.buffer);

  }
);
// =========================
// CUSTOMER REVIEWS
// =========================

// Submit a review
app.post("/api/reviews", function (req, res) {

  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, rating and review."
    });
  }

  const sql = `
    INSERT INTO reviews
    (name, rating, comment, status)
    VALUES (?, ?, ?, 'pending')
  `;

  db.query(
    sql,
    [name, rating, comment],
    function (err, result) {

      if (err) {
        console.log(
          "Review database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to submit review."
        });
      }

      console.log(
        "Review submitted:",
        result.insertId
      );

      res.json({
        success: true,
        message: "Review submitted successfully!"
      });

    }
  );
});


// Get approved reviews
app.get("/api/reviews", function (req, res) {

  const sql = `
    SELECT id, name, rating, comment, created_at
    FROM reviews
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;

  db.query(
    sql,
    function (err, results) {

      if (err) {
        console.log(
          "Reviews fetch error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch reviews."
        });
      }

      res.json({
        success: true,
        reviews: results
      });

    }
  );
});
// Get all reviews for admin
app.get("/api/admin/reviews", function (req, res) {

  const sql = `
    SELECT id, name, rating, comment, status, created_at
    FROM reviews
    ORDER BY created_at DESC
  `;

  db.query(sql, function (err, results) {

    if (err) {
      console.log("Admin reviews fetch error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch reviews."
      });
    }

    res.json({
      success: true,
      reviews: results
    });

  });
});


// Approve or reject a review
app.put("/api/admin/reviews/:id", function (req, res) {

  const { status } = req.body;
  const reviewId = req.params.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid review status."
    });
  }

  const sql = `
    UPDATE reviews
    SET status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [status, reviewId],
    function (err, result) {

      if (err) {
        console.log("Review update error:", err.message);

        return res.status(500).json({
          success: false,
          message: "Failed to update review."
        });
      }

      res.json({
        success: true,
        message: `Review ${status} successfully.`
      });

    }
  );
});
// Delete a review
app.delete("/api/admin/reviews/:id", function (req, res) {

  const reviewId = req.params.id;

  const sql = `
    DELETE FROM reviews
    WHERE id = ?
  `;

  db.query(
    sql,
    [reviewId],
    function (err, result) {

      if (err) {
        console.log("Review delete error:", err.message);

        return res.status(500).json({
          success: false,
          message: "Failed to delete review."
        });
      }

      res.json({
        success: true,
        message: "Review deleted successfully."
      });

    }
  );
});
// =========================
// VIDEO UPLOAD
// =========================

app.post("/api/videos", function (req, res) {

  console.log("VIDEO LINK REQUEST RECEIVED");

  const title = req.body.title;
  const category = req.body.category;
  const video = req.body.video;

  if (!title || !category || !video) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, category and video link."
    });
  }

  const sql = `
    INSERT INTO videos
    (title, category, video)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [title, category, video],
    function (err, result) {

      if (err) {
        console.log(
          "Video database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to save event video."
        });
      }

      console.log(
        "Event video added:",
        result.insertId
      );

      res.json({
        success: true,
        message: "Event video added successfully!",
        id: result.insertId,
        video: video
      });

    }
  );

});


// =========================
// GET EVENT VIDEOS
// =========================

app.get("/api/videos", function (req, res) {

  console.log("GET VIDEOS REQUEST RECEIVED-TEST");

  const sql = `
    SELECT id, title, category, video
    FROM videos
    ORDER BY id DESC
  `;

  db.query(sql, function (err, results) {

    if (err) {
      console.log(
        "Videos database error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch event videos."
      });
    }

    res.json({
      success: true,
      videos: results
    });

  });

});

// =========================
// DELETE GALLERY PHOTO
// =========================

app.delete("/api/gallery/:id", function (req, res) {

  const galleryId = req.params.id;

  console.log(
    "DELETE GALLERY REQUEST RECEIVED:",
    galleryId
  );

  const sql = `
    DELETE FROM gallery
    WHERE id = ?
  `;

  db.query(
    sql,
    [galleryId],
    function (err, result) {

      if (err) {

        console.log(
          "Gallery delete database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete gallery photo."
        });

      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: "Gallery photo not found."
        });

      }

      console.log(
        "Gallery photo deleted:",
        galleryId
      );

      res.json({
        success: true,
        message: "Gallery photo deleted successfully!"
      });

    }
  );

});
// =========================
// DELETE EVENT VIDEO
// =========================

app.delete("/api/videos/:id", function (req, res) {

  const videoId = req.params.id;

  console.log(
    "DELETE VIDEO REQUEST RECEIVED:",
    videoId
  );

  const sql = `
    DELETE FROM videos
    WHERE id = ?
  `;

  db.query(
    sql,
    [videoId],
    function (err, result) {

      if (err) {

        console.log(
          "Delete video database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete event video."
        });

      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: "Event video not found."
        });

      }

      console.log(
        "Event video deleted:",
        videoId
      );

      res.json({
        success: true,
        message: "Event video deleted successfully!"
      });

    }
  );

});
// =========================
// ADMIN LOGIN
// =========================

app.post("/api/admin/login", function (req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required."
    });
  }

  const sql = `
    SELECT id, username, password
    FROM admin
    WHERE username = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [username],
    function (err, results) {

      if (err) {

        console.log(
          "Admin login database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Unable to process admin login."
        });
      }

      if (
        results.length === 0 ||
        results[0].password !== password
      ) {

        return res.status(401).json({
          success: false,
          message: "Invalid admin username or password."
        });

      }

      res.json({
        success: true,
        message: "Admin login successful."
      });

    }
  );

});


// =========================
// CHANGE ADMIN PASSWORD
// =========================
console.log("CHANGE PASSWORD ROUTE LOADED");
app.put("/api/admin/change-password", function (req, res) {
  console.log("CHANGE PASSWORD REQUEST RECEIVED");

  const {
    username,
    currentPassword,
    newPassword
  } = req.body;

  if (
    !username ||
    !currentPassword ||
    !newPassword
  ) {

    return res.status(400).json({
      success: false,
      message: "Please provide all password fields."
    });

  }

  if (newPassword.length < 6) {

    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long."
    });

  }

  const findSql = `
    SELECT id, password
    FROM admin
    WHERE username = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [username],
    function (err, results) {
      console.log("CHANGE PASSWORD RESULTS:", results);

      if (err) {

        console.log(
          "Change password database error:",
          err.message
        );

        return res.status(500).json({
          success: false,
          message: "Unable to change password."
        });

      }

      if (results.length === 0) {

        return res.status(404).json({
          success: false,
          message: "Admin account not found."
        });

      }

      if (results[0].password !== currentPassword) {

        return res.status(401).json({
          success: false,
          message: "Current password is incorrect."
        });

      }

      const updateSql = `
        UPDATE admin
        SET password = ?
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [newPassword, results[0].id],
        function (updateErr) {

          if (updateErr) {

            console.log(
              "Password update database error:",
              updateErr.message
            );

            return res.status(500).json({
              success: false,
              message: "Failed to update password."
            });

          }

          res.json({
            success: true,
            message: "Password changed successfully!"
          });

        }
      );

    }
  );

});


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {

  console.log(
    `VK EVENTS Backend running on port ${PORT}`
  );
});

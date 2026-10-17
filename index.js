const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

app.post("/api/apply", upload.single("cvFile"), async (req, res) => {
  try {
    const { fullName, email, phone, role, portfolio, why } = req.body;
    const file = req.file;

    const attachments = file
      ? [
          {
            filename: file.originalname,
            content: file.buffer.toString("base64"),
          },
        ]
      : [];

    const payload = {
      from: "The Right Talent Careers <onboarding@resend.dev>",
      to: ["teamrightalent@gmail.com"], // <-- Now works with the new key!
      subject: `New Application: ${role} - ${fullName}`,
      text: `
        New Job Application
        
        Name: ${fullName}
        Email: ${email}
        Phone: ${phone}
        Role: ${role}
        Portfolio: ${portfolio || "N/A"}
        
        Why The Right Talent?
        ${why}
      `,
      attachments: attachments,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        // This reads the key from the .env file
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: "Email sent successfully" });
    } else {
      const error = await response.text();
      console.error("Resend Error:", error);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
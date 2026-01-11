const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

// الاتصال بالقاعدة
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// المجلد الثابت للصور
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// الروابط (Routes)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

app.get("/", (req, res) => {
  res.send("API is running correctly...");
});

// بدلاً من app.listen التقليدي في النهاية
// فيرسل يحتاج تصدير الـ app
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // السطر ده هو اللي بيخلي فيرسل يشوف السيرفر

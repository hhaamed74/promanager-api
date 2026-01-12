const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. التأكد من وجود مجلد uploads، وإذا لم يوجد يتم إنشاؤه تلقائياً
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. إعداد التخزين على القرص (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // تحديد المجلد الذي ستُحفظ فيه الصور
  },
  filename: (req, file, cb) => {
    // تكوين اسم فريد للملف: التاريخ + الاسم الأصلي
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 3. فلترة الملفات (التأكد من أنها صور فقط)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("عذراً، يسمح برفع الصور فقط (jpg, png, webp)"));
  }
};

// 4. تهيئة Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى 5 ميجابايت
});

module.exports = upload;

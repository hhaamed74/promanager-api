const multer = require("multer");

// 1. استخدام MemoryStorage بدلاً من DiskStorage
const storage = multer.memoryStorage();

// 2. نفس الفلتر بتاعك (ممتاز ومش محتاج تغيير)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("مسموح برفع الصور فقط (jpg, png, webp)"), false);
  }
};

// 3. الإعدادات النهائية
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // قلل الحجم لـ 2MB لسرعة الـ Serverless
});

module.exports = upload;

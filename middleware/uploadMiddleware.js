const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 1. Configuration: الربط مع حساب كلوديناري
// تأكد من إضافة هذه المتغيرات في Environment Variables على Vercel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cloud Storage Configuration: إعدادات التخزين السحابي
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "promanager_uploads", // اسم الفولدر اللي هيتفتح في كلوديناري
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

// 3. Multer Middleware Initialization
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;

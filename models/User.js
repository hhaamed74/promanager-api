const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "برجاء إضافة الاسم"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "برجاء إضافة البريد الإلكتروني"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "برجاء إضافة بريد إلكتروني صحيح",
      ],
    },
    password: {
      type: String,
      required: [true, "برجاء إضافة كلمة المرور"],
      minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dkhu7rv9q/image/upload/v1680000000/default-avatar.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save Middleware - الحـل النهـائي
 * نستخدم async بدون كلمة next تماماً لتجنب TypeError
 */

userSchema.pre("save", async function () {
  // 1. التحقق إذا كانت كلمة المرور قد عُدلت
  if (!this.isModified("password")) {
    return; // في الـ async، كلمة return تنهي الـ middleware بنجاح
  }

  // 2. تشفير كلمة المرور
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // لا تستدعي next() هنا أبداً
});

/**
 * Instance Method: matchPassword
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان المشروع مطلوب"],
      trim: true,
      maxlength: [100, "العنوان لا يمكن أن يزيد عن 100 حرف"],
    },
    description: {
      type: String,
      required: [true, "وصف المشروع مطلوب"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["قيد الانتظار", "جاري العمل", "مكتمل"],
      default: "قيد الانتظار",
    },
    priority: {
      type: String,
      enum: ["منخفضة", "متوسطة", "عالية"],
      default: "متوسطة",
    },
    deadline: {
      type: Date,
      required: [true, "يجب تحديد تاريخ انتهاء للمشروع"],
    },
    category: {
      type: String,
      enum: ["برمجة", "تصميم", "تسويق", "إدارة", "أخرى"],
      default: "أخرى",
    },
    image: {
      type: String,
      // التعديل: نضع رابط صورة افتراضية HTTPS لضمان عدم حدوث Mixed Content
      default: "https://via.placeholder.com/800x400?text=No+Project+Image",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

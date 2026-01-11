const mongoose = require("mongoose"); // Import Mongoose library for MongoDB interaction

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان المشروع مطلوب"], // Validation: Project title is mandatory
      trim: true, // Remove extra spaces from the title
      maxlength: [100, "العنوان لا يمكن أن يزيد عن 100 حرف"], // Title length restriction
    },
    description: {
      type: String,
      required: [true, "وصف المشروع مطلوب"], // Validation: Project description is mandatory
      trim: true, // Remove extra spaces from the description
    },
    /**
     * Project Workflow Fields
     */
    status: {
      type: String,
      enum: ["قيد الانتظار", "جاري العمل", "مكتمل"], // Valid status values in Arabic
      default: "قيد الانتظار", // Default project status
    },
    priority: {
      type: String,
      enum: ["منخفضة", "متوسطة", "عالية"], // Valid priority values in Arabic
      default: "متوسطة", // Default priority level
    },
    deadline: {
      type: Date,
      required: [true, "يجب تحديد تاريخ انتهاء للمشروع"], // Validation: Deadline date is required
    },
    category: {
      type: String,
      enum: ["برمجة", "تصميم", "تسويق", "إدارة", "أخرى"], // Project category categories in Arabic
      default: "أخرى", // Default category
    },
    image: {
      type: String, // Field to store the path/URL of the project image
      default: "default-project.jpg", // Fallback image if none is provided
    },
    /**
     * Relational Data
     */
    user: {
      type: mongoose.Schema.Types.ObjectId, // Data type to store MongoDB ObjectId
      ref: "User", // Reference link to the User collection/model
      required: true, // Each project must be linked to a specific user
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt timestamps
);

module.exports = mongoose.model("Project", projectSchema); // Export the Project model for use in other files

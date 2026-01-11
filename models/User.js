const mongoose = require("mongoose"); // Import Mongoose for MongoDB object modeling
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing and security

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "برجاء إضافة الاسم"], // Validation to ensure name exists in Arabic
      trim: true, // Removes whitespace from both ends of the string
    },
    email: {
      type: String,
      required: [true, "برجاء إضافة البريد الإلكتروني"], // Ensures email is provided in Arabic
      unique: true, // Prevents duplicate email registration in the database
      lowercase: true, // Converts email to lowercase before saving
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "برجاء إضافة بريد إلكتروني صحيح", // Regex validation for email format in Arabic
      ],
    },
    password: {
      type: String,
      required: [true, "برجاء إضافة كلمة المرور"], // Ensures password is provided in Arabic
      minlength: [6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"], // Minimum security length in Arabic
      select: false, // Prevents the password from being returned in standard queries for security
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Restricts values to either 'user' or 'admin'
      default: "user", // Default role assigned to new users
    },
    avatar: {
      type: String,
      default: "uploads/default-avatar.png", // Default profile picture path
    },
    isActive: {
      type: Boolean,
      default: true, // Account status feature (Active or Inactive)
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' fields
);

/**
 * Pre-save Middleware
 * Hashes the password before it is saved to the database
 */
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a security salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next(); // Proceed to the save operation
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

/**
 * Instance Method: matchPassword
 * Compares the entered password with the hashed password in the database
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if passwords match
};

module.exports = mongoose.model("User", userSchema); // Export the User model for use in controllers

const User = require("../models/User"); // Import User model
const jwt = require("jsonwebtoken"); // Import JWT for token generation

/**
 * Helper function to generate a JWT token
 * @param {string} id - The user ID to encode in the token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
// أضف next هنا في المعاملات لضمان أن الترتيب (req, res, next)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // التحقق من وجود المستخدم
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "هذا البريد مسجل بالفعل" });
    }

    // التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "كلمات المرور غير متطابقة" });
    }

    // إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    // إرسال الرد بنجاح
    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // هنا مربط الفرس: إذا لم تكن next دالة، سنستخدم res مباشرة
    console.error("Caught error in register:", error.message);

    if (typeof next === "function") {
      return next(error);
    } else {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password field for comparison
    const user = await User.findOne({ email }).select("+password");

    // Verify user existence and password validity
    if (user && (await user.matchPassword(password))) {
      // Check if account is active
      if (!user.isActive)
        return res
          .status(401)
          .json({ success: false, message: "هذا الحساب معطل" });

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile data
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });

    // Update basic info if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update avatar filename if a new file is uploaded
    if (req.file) {
      user.avatar = req.file.filename;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a user account
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin Only)
 */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Enable or Disable user account
 * @route   PUT /api/auth/users/:id/toggle
 * @access  Private (Admin Only)
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // Reverse the current active status
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      status: user.isActive,
      message: "تم تغيير الحالة",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/auth/users
 * @access  Private (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort("-createdAt");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get system-wide statistics for the dashboard
 * @route   GET /api/auth/stats
 * @access  Public
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const Project = require("../models/Project"); // Internal import to avoid circular dependency
    const projectsCount = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: "مكتمل" });

    res.json({
      success: true,
      stats: {
        users: usersCount,
        projects: projectsCount,
        completed: completedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get recent system activities and notifications
 * @route   GET /api/auth/activities
 * @access  Private (Admin Only)
 */
exports.getActivities = async (req, res) => {
  try {
    const Project = require("../models/Project");

    // Retrieve the 5 most recent users and projects
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const latestProjects = await Project.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    let notifications = [];

    // Format user notifications
    latestUsers.forEach((u) => {
      notifications.push({
        text: `مستخدم جديد انضم إلينا: ${u.name}`,
        date: u.createdAt,
        type: "user",
      });
    });

    // Format project notifications
    latestProjects.forEach((p) => {
      notifications.push({
        text: `مشروع جديد مرفوع: ${p.title} بواسطة ${p.user?.name || "مستخدم"}`,
        date: p.createdAt,
        type: "project",
      });
    });

    // Sort notifications by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Send only the top 5 most recent activities
    res.json({ success: true, data: notifications.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

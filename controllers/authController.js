const User = require("../models/User");
const Project = require("../models/Project");
const Activity = require("../models/Activity"); // ضروري جداً لعمل الإشعارات
const jwt = require("jsonwebtoken");

/**
 * دالة مساعدة لإنشاء التوكن (JWT)
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// --- وظائف المستخدم العامة ---

/**
 * @desc    تسجيل مستخدم جديد
 * @route   POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "هذا البريد مسجل بالفعل" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "كلمات المرور غير متطابقة" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    // تسجيل نشاط: مستخدم جديد انضم
    await Activity.create({
      user: user._id,
      message: `مستخدم جديد انضم للنظام: ${user.name}`,
      type: "user",
    });

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
    res
      .status(500)
      .json({ success: false, message: "خطأ في السيرفر أثناء التسجيل" });
  }
};

/**
 * @desc    تسجيل الدخول
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "هذا الحساب معطل" });
      }

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
 * @desc    تحديث بيانات البروفايل
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

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

// --- وظائف الإدارة (Admin Only) ---

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort("-createdAt");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      status: user.isActive,
      message: user.isActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- وظائف الإحصائيات والنشاطات (المعدلة) ---

/**
 * @desc    جلب إحصائيات لوحة التحكم
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
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
 * @desc    جلب آخر النشاطات الحقيقية من الداتابيز
 * @route   GET /api/auth/activities
 */
exports.getActivities = async (req, res) => {
  try {
    // جلب الأنشطة وترتيبها من الأحدث
    const activities = await Activity.find()
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

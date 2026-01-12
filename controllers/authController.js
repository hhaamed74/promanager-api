const User = require("../models/User"); // استيراد موديل المستخدم
const jwt = require("jsonwebtoken"); // استيراد JWT لإنشاء التوكين

/**
 * دالة مساعدة لإنشاء التوكن (JWT)
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
 * @desc    تسجيل مستخدم جديد
 * @route   POST /api/auth/register
 * @access  Public
 */
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
    console.error("Caught error in register:", error.message);
    res
      .status(500)
      .json({ success: false, message: "خطأ في السيرفر أثناء التسجيل" });
  }
};

/**
 * @desc    تسجيل الدخول
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم مع إظهار كلمة المرور للمقارنة
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // التحقق مما إذا كان الحساب نشطاً
      if (!user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "هذا الحساب معطل من قبل المسؤول" });
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
 * @desc    تحديث بيانات البروفايل (متوافق مع Cloudinary)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    // تحديث البيانات الأساسية
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // تحديث الصورة: إذا تم رفع ملف، نستخدم رابط Cloudinary (req.file.path)
    if (req.file) {
      user.avatar = req.file.path; // Cloudinary يرجع رابط HTTPS كامل هنا
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
 * @desc    حذف حساب مستخدم
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
 * @desc    تغيير حالة الحساب (تعطيل/تفعيل)
 * @route   PUT /api/auth/users/:id/toggle
 * @access  Private (Admin Only)
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });

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

/**
 * @desc    جلب قائمة كل المستخدمين
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
 * @desc    جلب إحصائيات لوحة التحكم
 * @route   GET /api/auth/stats
 * @access  Public/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const Project = require("../models/Project");
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
 * @desc    جلب آخر النشاطات والإشعارات
 * @route   GET /api/auth/activities
 * @access  Private (Admin Only)
 */
exports.getActivities = async (req, res) => {
  try {
    const Project = require("../models/Project");

    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const latestProjects = await Project.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    let notifications = [];

    latestUsers.forEach((u) => {
      notifications.push({
        text: `مستخدم جديد انضم إلينا: ${u.name}`,
        date: u.createdAt,
        type: "user",
      });
    });

    latestProjects.forEach((p) => {
      notifications.push({
        text: `مشروع جديد: ${p.title} بواسطة ${p.user?.name || "مجهول"}`,
        date: p.createdAt,
        type: "project",
      });
    });

    // ترتيب الإشعارات من الأحدث للأقدم
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: notifications.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

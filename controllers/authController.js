const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// --- تعريف الدوال ---

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "هذا البريد مسجل بالفعل" });
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ success: false, message: "كلمات المرور غير متطابقة" });

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
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      if (!user.isActive)
        return res
          .status(401)
          .json({ success: false, message: "هذا الحساب معطل" });
      return res.json({
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
    }
    return res
      .status(401)
      .json({ success: false, message: "بيانات الدخول غير صحيحة" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const Project = require("../models/Project");
    const projectsCount = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: "مكتمل" });
    return res.json({
      success: true,
      stats: {
        users: usersCount,
        projects: projectsCount,
        completed: completedProjects,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.file) {
      user.avatar = req.file.filename;
    }
    const updatedUser = await user.save();
    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort("-createdAt");
    return res.json({ success: true, data: users });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    return res.json({
      success: true,
      status: user.isActive,
      message: "تم تغيير الحالة",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

const getActivities = async (req, res, next) => {
  try {
    const Project = require("../models/Project");
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const latestProjects = await Project.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);
    let notifications = [];
    latestUsers.forEach((u) =>
      notifications.push({
        text: `مستخدم جديد: ${u.name}`,
        date: u.createdAt,
        type: "user",
      })
    );
    latestProjects.forEach((p) =>
      notifications.push({
        text: `مشروع جديد: ${p.title}`,
        date: p.createdAt,
        type: "project",
      })
    );
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, data: notifications.slice(0, 5) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطأ داخلي: " + error.message });
  }
};

// --- التصدير النهائي ---
module.exports = {
  register,
  login,
  updateUserProfile,
  getAllUsers,
  getDashboardStats,
  deleteUser,
  toggleUserStatus,
  getActivities,
};

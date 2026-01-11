const Project = require("../models/Project");

// 1. تعريف الدوال كمتغيرات (Constants) لضمان استقرارها في بيئة Serverless
const createProject = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, category } =
      req.body;

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      deadline,
      category,
      // ملاحظة: memoryStorage مفيهاش path، لو بترفع صور استخدم Buffer أو Cloudinary
      image: req.file ? req.file.originalname : "",
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "تم إضافة المشروع بنجاح 🚀",
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "فشل في إضافة المشروع",
      error: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user", "name avatar")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    if (project.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "غير مسموح لك بتعديل هذا المشروع" });
    }

    let updatedData = { ...req.body };
    if (req.file) {
      updatedData.image = req.file.originalname;
    }

    project = await Project.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    if (project.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "غير مسموح لك بحذف هذا المشروع" });
    }

    await project.deleteOne();
    res.json({ success: true, message: "تم حذف المشروع بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "المشروع غير موجود" });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({ user: req.user.id });
    const completedProjects = await Project.countDocuments({
      user: req.user.id,
      status: "مكتمل",
    });
    res.status(200).json({
      success: true,
      data: { total: totalProjects, completed: completedProjects },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في جلب الإحصائيات" });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort(
      "-createdAt"
    );
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. التصدير الموحد (أهم سطر عشان فيرسل يشوف الدوال صح وما يطلعش خطأ الـ next)
module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById,
  getProjectStats,
  getMyProjects,
};

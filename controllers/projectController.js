const Project = require("../models/Project");
const Activity = require("../models/Activity");

/**
 * @desc    إنشاء مشروع جديد وتسجيل النشاط
 * @route   POST /api/projects
 */
exports.createProject = async (req, res) => {
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
      image: req.file ? req.file.filename : "",
      user: req.user.id,
    });

    // تسجيل النشاط في قاعدة البيانات ليظهر في الإشعارات
    await Activity.create({
      user: req.user.id,
      message: `قام المستخدم ${req.user.name} بإضافة مشروع جديد: ${title}`,
      type: "project",
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

/**
 * @desc    تعديل مشروع موجود
 * @route   PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
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
      updatedData.image = req.file.filename;
    }

    project = await Project.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    // اختياري: تسجيل نشاط عند التعديل
    await Activity.create({
      user: req.user.id,
      message: `تم تحديث بيانات المشروع: ${project.title}`,
      type: "project",
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    جلب كل المشاريع
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user", "name avatar")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    حذف مشروع وتسجيل النشاط
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    if (project.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "غير مسموح لك بحذف هذا المشروع" });
    }

    await Activity.create({
      user: req.user.id,
      message: `تم حذف المشروع: ${project.title}`,
      type: "project",
    });

    await project.deleteOne();
    res.json({ success: true, message: "تم حذف المشروع بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    جلب بيانات مشروع واحد
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "user",
      "name avatar"
    );
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "المشروع غير موجود" });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
};

/**
 * @desc    جلب مشاريعي الشخصية
 */
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort(
      "-createdAt"
    );
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    إحصائيات مشاريع المستخدم
 */
exports.getProjectStats = async (req, res) => {
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

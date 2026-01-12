const Project = require("../models/Project"); // استيراد موديل المشروع

/**
 * @desc    إنشاء مشروع جديد
 * @route   POST /api/projects
 * @access  Private
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
      // التعديل هنا: نأخذ الرابط من كلوديناري مباشرة بدون replace
      image: req.file ? req.file.path : "",
      user: req.user.id, // ربط المشروع بالمستخدم اللي عامل login
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
 * @access  Private (المالك أو الأدمن)
 */
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    // التحقق من الصلاحية
    if (project.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "غير مسموح لك بتعديل هذا المشروع" });
    }

    let updatedData = { ...req.body };

    // إذا تم رفع صورة جديدة، نحدث الرابط برابط كلوديناري الجديد
    if (req.file) {
      updatedData.image = req.file.path;
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

/**
 * @desc    جلب كل المشاريع مع بيانات أصحابها
 * @route   GET /api/projects
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("user", "name avatar") // جلب اسم وصورة صاحب المشروع
      .sort("-createdAt");

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    حذف مشروع
 * @route   DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
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
 * @desc    إحصائيات المشاريع للمستخدم الحالي
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
      data: {
        total: totalProjects,
        completed: completedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطأ في جلب الإحصائيات" });
  }
};

/**
 * @desc    جلب مشاريعي فقط
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

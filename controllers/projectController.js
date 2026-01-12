const Project = require("../models/Project"); // Import the Project model

/**
 * @desc    Create a new project
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
      // Normalize image path by replacing backslashes with forward slashes
      image: req.file ? req.file.path.replace(/\\/g, "/") : "",
      user: req.user.id, // Link project to the currently authenticated user
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
 * @desc    Get all projects with owner details
 * @route   GET /api/projects
 * @access  Private
 */
exports.getProjects = async (req, res) => {
  try {
    // Fetch all projects and populate user details (name and avatar)
    const projects = await Project.find()
      .populate("user", "name avatar")
      .sort("-createdAt"); // Sort by newest first

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing project
 * @route   PUT /api/projects/:id
 * @access  Private (Owner or Admin)
 */
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    // Authorization check: only owner or admin can update
    if (project.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "غير مسموح لك بتعديل هذا المشروع" });
    }

    // Combine textual data from request body
    let updatedData = { ...req.body };

    // Update image path if a new file is uploaded
    if (req.file) {
      updatedData.image = req.file.path.replace(/\\/g, "/");
    }

    // Apply updates and return the modified document
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
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });

    // Authorization check: only owner or admin can delete
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
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
exports.getProjectById = async (req, res) => {
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

/**
 * @desc    Get counts for dashboard statistics
 * @route   GET /api/projects/stats/count
 * @access  Private
 */
exports.getProjectStats = async (req, res) => {
  try {
    // Count total projects belonging to the logged-in user
    const totalProjects = await Project.countDocuments({ user: req.user.id });

    // Count only projects marked as "مكتمل" for the user
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
 * @desc    Get projects belonging only to the current user
 * @route   GET /api/projects/my-projects
 * @access  Private
 */
exports.getMyProjects = async (req, res) => {
  try {
    // Filter projects by user ID extracted from the 'protect' middleware
    const projects = await Project.find({ user: req.user.id }).sort(
      "-createdAt"
    );

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

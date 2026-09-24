const { fileUrl } = require('../middleware/upload');
const PortfolioProject = require('../models/PortfolioProject');

// PUBLIC
exports.getPublishedProjects = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    const projects = await PortfolioProject.find(filter).sort('displayOrder').populate('service', 'name slug');
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await PortfolioProject.findOne({ slug: req.params.slug, isPublished: true }).populate('service', 'name slug');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ADMIN
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await PortfolioProject.find().sort('-createdAt').populate('service', 'name slug');
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await PortfolioProject.findById(req.params.id).populate('service', 'name slug');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.titleEn) data.title = { en: data.titleEn, kn: data.titleKn || '' };
    if (data.descEn) data.description = { en: data.descEn, kn: data.descKn || '' };
    if (req.files) {
      if (req.files.coverImage) data.coverImage = fileUrl(req.files.coverImage[0]);
      if (req.files.images) data.images = req.files.images.map(f => fileUrl(f));
    }
    const project = await PortfolioProject.create(data);
    res.status(201).json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.titleEn !== undefined) data.title = { en: data.titleEn, kn: data.titleKn || '' };
    if (data.descEn !== undefined) data.description = { en: data.descEn, kn: data.descKn || '' };
    if (req.files) {
      if (req.files.coverImage) data.coverImage = fileUrl(req.files.coverImage[0]);
      if (req.files.images) {
        const existing = JSON.parse(data.existingImages || '[]');
        data.images = [...existing, ...req.files.images.map(f => fileUrl(f))];
      }
    }
    const project = await PortfolioProject.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    await PortfolioProject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const { fileUrl } = require('../middleware/upload');
const HomePage = require('../models/HomePage');
const QuickShoot = require('../models/QuickShoot');
const QuickShootVideo = require('../models/QuickShootVideo');
const ProjectPartner = require('../models/ProjectPartner');
const Enquiry = require('../models/Enquiry');
const Client = require('../models/Client');
const Testimonial = require('../models/Testimonial');
const WebsiteContent = require('../models/WebsiteContent');
const BrandSettings = require('../models/BrandSettings');

// ═══════════════ HOME PAGE — file upload only ═══════════════
exports.getActiveHomeVideo = async (req, res) => {
  try {
    const video = await HomePage.findOne({ isActive: true });
    res.json(video);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllHomeVideos = async (req, res) => {
  try { res.json(await HomePage.find().sort('-createdAt')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.uploadHomeVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please select a video file.' });
    const video = await HomePage.create({
      videoFile: fileUrl(req.file),
      videoType: 'upload',
      title: req.body.title || req.file.originalname,
      isActive: false,
    });
    res.status(201).json(video);
  } catch (e) {
    console.error('Upload home video error:', e);
    res.status(500).json({ message: e.message });
  }
};

exports.updateHomeVideo = async (req, res) => {
  try {
    const update = {};
    if (req.file) update.videoFile = fileUrl(req.file);
    if (req.body.isActive === 'true' || req.body.isActive === true) {
      await HomePage.updateMany({}, { isActive: false });
      update.isActive = true;
    }
    if (req.body.isActive === 'false') update.isActive = false;
    if (req.body.title) update.title = req.body.title;
    const video = await HomePage.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(video);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteHomeVideo = async (req, res) => {
  try {
    await HomePage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ QUICK SHOOTS ═══════════════
exports.getActiveQuickShoots = async (req, res) => {
  try { res.json(await QuickShoot.find({ isActive: true }).sort('displayOrder')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllQuickShoots = async (req, res) => {
  try { res.json(await QuickShoot.find().sort('displayOrder')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createQuickShoot = async (req, res) => {
  try {
    const data = {
      name: { en: req.body.nameEn || '', kn: req.body.nameKn || '' },
      description: { en: req.body.descEn || '', kn: req.body.descKn || '' },
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== 'false',
    };
    if (!data.slug) data.slug = (req.body.nameEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (req.file) data.image = fileUrl(req.file);
    res.status(201).json(await QuickShoot.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateQuickShoot = async (req, res) => {
  try {
    const update = {};
    if (req.body.nameEn !== undefined) update.name = { en: req.body.nameEn, kn: req.body.nameKn || '' };
    if (req.body.descEn !== undefined) update.description = { en: req.body.descEn, kn: req.body.descKn || '' };
    if (req.body.displayOrder !== undefined) update.displayOrder = Number(req.body.displayOrder);
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.file) update.image = fileUrl(req.file);
    res.json(await QuickShoot.findByIdAndUpdate(req.params.id, update, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteQuickShoot = async (req, res) => {
  try {
    await QuickShootVideo.deleteMany({ quickShoot: req.params.id });
    await QuickShoot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ QUICK SHOOT VIDEOS ═══════════════
exports.getQuickShootVideos = async (req, res) => {
  try {
    const videos = await QuickShootVideo.find({ quickShoot: req.params.quickShootId }).sort('displayOrder');
    res.json(videos);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getActiveQuickShootVideos = async (req, res) => {
  try {
    const videos = await QuickShootVideo.find({ quickShoot: req.params.quickShootId, isActive: true }).sort('displayOrder');
    res.json(videos);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addQuickShootVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please select a video file.' });
    const video = await QuickShootVideo.create({
      quickShoot: req.params.quickShootId,
      title: req.body.title || 'Untitled',
      videoFile: fileUrl(req.file),
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: true,
    });
    res.status(201).json(video);
  } catch (e) {
    console.error('Add QS video error:', e);
    res.status(500).json({ message: e.message });
  }
};

exports.updateQuickShootVideo = async (req, res) => {
  try {
    const update = {};
    if (req.body.title) update.title = req.body.title;
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.displayOrder !== undefined) update.displayOrder = Number(req.body.displayOrder);
    if (req.file) update.videoFile = fileUrl(req.file);
    res.json(await QuickShootVideo.findByIdAndUpdate(req.params.videoId, update, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteQuickShootVideo = async (req, res) => {
  try {
    await QuickShootVideo.findByIdAndDelete(req.params.videoId);
    res.json({ message: 'Video deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ PROJECT PARTNERS ═══════════════
exports.getVerifiedPartners = async (req, res) => {
  try { res.json(await ProjectPartner.find({ verificationStatus: 'verified', isActive: true }).sort('-createdAt')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllPartners = async (req, res) => {
  try { res.json(await ProjectPartner.find().sort('-createdAt')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createPartner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = fileUrl(req.file);
    res.status(201).json(await ProjectPartner.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updatePartner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = fileUrl(req.file);
    if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true;
    res.json(await ProjectPartner.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deletePartner = async (req, res) => {
  try { await ProjectPartner.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ ENQUIRIES ═══════════════
exports.createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllEnquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    res.json(await Enquiry.find(filter).sort('-createdAt'));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Not found' });
    res.json(enquiry);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateEnquiry = async (req, res) => {
  try {
    res.json(await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteEnquiry = async (req, res) => {
  try { await Enquiry.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ CLIENTS ═══════════════
exports.getActiveClients = async (req, res) => {
  try { res.json(await Client.find({ isActive: true }).sort('displayOrder')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllClients = async (req, res) => {
  try { res.json(await Client.find().sort('displayOrder')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createClient = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      website: req.body.website || '',
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== 'false',
    };
    if (req.file) data.logo = fileUrl(req.file);
    res.status(201).json(await Client.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateClient = async (req, res) => {
  try {
    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.website !== undefined) data.website = req.body.website;
    if (req.body.displayOrder !== undefined) data.displayOrder = Number(req.body.displayOrder);
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.isFeatured !== undefined) data.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.file) data.logo = fileUrl(req.file);
    res.json(await Client.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteClient = async (req, res) => {
  try { await Client.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ TESTIMONIALS ═══════════════
exports.getActiveTestimonials = async (req, res) => {
  try { res.json(await Testimonial.find({ isActive: true }).sort('displayOrder')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllTestimonials = async (req, res) => {
  try { res.json(await Testimonial.find().sort('-createdAt')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createTestimonial = async (req, res) => {
  try {
    const data = {
      clientName: req.body.clientName,
      company: req.body.company || '',
      testimonial: { en: req.body.testimonialEn || '', kn: req.body.testimonialKn || '' },
      rating: Number(req.body.rating) || 5,
      isActive: req.body.isActive !== 'false',
    };
    if (req.file) data.profileImage = fileUrl(req.file);
    res.status(201).json(await Testimonial.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const data = {};
    if (req.body.clientName) data.clientName = req.body.clientName;
    if (req.body.company !== undefined) data.company = req.body.company;
    if (req.body.testimonialEn !== undefined) data.testimonial = { en: req.body.testimonialEn, kn: req.body.testimonialKn || '' };
    if (req.body.rating) data.rating = Number(req.body.rating);
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.isFeatured !== undefined) data.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.file) data.profileImage = fileUrl(req.file);
    res.json(await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteTestimonial = async (req, res) => {
  try { await Testimonial.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ WEBSITE CONTENT ═══════════════
exports.getWebsiteContent = async (req, res) => {
  try {
    const content = await WebsiteContent.find();
    const map = {};
    content.forEach(c => { map[c.section] = c.content; });
    res.json(map);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getContentBySection = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section });
    res.json(content || { section: req.params.section, content: { en: {}, kn: {} } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateWebsiteContent = async (req, res) => {
  try {
    const content = await WebsiteContent.findOneAndUpdate(
      { section: req.params.section },
      { section: req.params.section, content: req.body.content },
      { new: true, upsert: true }
    );
    res.json(content);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ BRAND SETTINGS ═══════════════
exports.getBrandSettings = async (req, res) => {
  try {
    let settings = await BrandSettings.findOne();
    if (!settings) settings = await BrandSettings.create({});
    res.json(settings);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateBrandSettings = async (req, res) => {
  try {
    const data = {};
    const fields = ['brandName','phone','email','location','instagram','whatsapp','facebook','youtube','linkedin'];
    fields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    if (req.file) data.logo = fileUrl(req.file);
    let settings = await BrandSettings.findOne();
    if (!settings) {
      settings = await BrandSettings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    res.json(settings);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ DASHBOARD STATS ═══════════════
exports.getDashboardStats = async (req, res) => {
  try {
    const Service = require('../models/Service');
    const PortfolioProject = require('../models/PortfolioProject');
    const [totalServices, activeServices, totalProjects, totalEnquiries, newEnquiries, verifiedPartners, totalClients, totalTestimonials] = await Promise.all([
      Service.countDocuments(), Service.countDocuments({ isActive: true }),
      PortfolioProject.countDocuments(), Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      ProjectPartner.countDocuments({ verificationStatus: 'verified', isActive: true }),
      Client.countDocuments({ isActive: true }), Testimonial.countDocuments({ isActive: true }),
    ]);
    const recentEnquiries = await Enquiry.find().sort('-createdAt').limit(5);
    const recentProjects = await PortfolioProject.find().sort('-createdAt').limit(5);
    res.json({ totalServices, activeServices, totalProjects, totalEnquiries, newEnquiries, verifiedPartners, totalClients, totalTestimonials, recentEnquiries, recentProjects });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════ PUBLIC STATS (auto + manual) ═══════════════
exports.getPublicStats = async (req, res) => {
  try {
    const Service = require('../models/Service');
    const PortfolioProject = require('../models/PortfolioProject');
    const ServiceVideo = require('../models/ServiceVideo');
    // Auto counts
    const autoProjects = await PortfolioProject.countDocuments({ isPublished: true });
    const autoBrands = await Client.countDocuments({ isActive: true });
    const autoServices = await Service.countDocuments({ isActive: true });
    const autoContent = await ServiceVideo.countDocuments({ isActive: true });
    // Manual overrides from website content
    const statsContent = await WebsiteContent.findOne({ section: 'stats' });
    const manual = statsContent?.content || {};
    res.json({
      projects: manual.projects || autoProjects,
      brands: manual.brands || autoBrands,
      campaigns: manual.campaigns || autoServices,
      contentPieces: manual.contentPieces || autoContent,
      auto: { projects: autoProjects, brands: autoBrands, campaigns: autoServices, contentPieces: autoContent },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateManualStats = async (req, res) => {
  try {
    const stats = await WebsiteContent.findOneAndUpdate(
      { section: 'stats' },
      { section: 'stats', content: req.body },
      { new: true, upsert: true }
    );
    res.json(stats);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const auth = require('../controllers/authController');
const svc = require('../controllers/serviceController');
const port = require('../controllers/portfolioController');
const gen = require('../controllers/generalController');

// ─── AUTH ───
router.post('/auth/login', auth.login);
router.post('/auth/register', auth.register);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password/:token', auth.resetPassword);
router.get('/auth/profile', protect, auth.getProfile);
router.put('/auth/profile', protect, auth.updateProfile);

// ─── PARTNER ACCOUNTS ───
router.get('/admin/partner-accounts', protect, auth.getPartnerAccounts);
router.post('/admin/partner-accounts', protect, auth.createPartner);
router.put('/admin/partner-accounts/:id', protect, auth.updatePartnerAccount);
router.delete('/admin/partner-accounts/:id', protect, auth.deletePartnerAccount);

// ─── PUBLIC ROUTES ───
router.get('/public/services', svc.getActiveServices);
router.get('/public/services/:slug', svc.getServiceBySlug);
router.get('/public/projects', port.getPublishedProjects);
router.get('/public/projects/:slug', port.getProjectBySlug);
router.get('/public/home-video', gen.getActiveHomeVideo);
router.get('/public/quick-shoots', gen.getActiveQuickShoots);
router.get('/public/quick-shoots/:quickShootId/videos', gen.getActiveQuickShootVideos);
router.get('/public/partners', gen.getVerifiedPartners);
router.get('/public/clients', gen.getActiveClients);
router.get('/public/testimonials', gen.getActiveTestimonials);
router.get('/public/content', gen.getWebsiteContent);
router.get('/public/content/:section', gen.getContentBySection);
router.get('/public/brand', gen.getBrandSettings);
router.get('/public/stats', gen.getPublicStats);
router.post('/public/enquiry', gen.createEnquiry);

// ─── ADMIN ───
router.get('/admin/dashboard', protect, gen.getDashboardStats);

// Home Videos
router.get('/admin/home-videos', protect, gen.getAllHomeVideos);
router.post('/admin/home-videos', protect, upload.single('video'), gen.uploadHomeVideo);
router.put('/admin/home-videos/:id', protect, upload.single('video'), gen.updateHomeVideo);
router.delete('/admin/home-videos/:id', protect, gen.deleteHomeVideo);

// Services
router.get('/admin/services', protect, svc.getAllServices);
router.get('/admin/services/:id', protect, svc.getServiceById);
router.post('/admin/services', protect, upload.single('mainImage'), svc.createService);
router.put('/admin/services/:id', protect, upload.single('mainImage'), svc.updateService);
router.delete('/admin/services/:id', protect, svc.deleteService);

// Service Videos
router.get('/admin/services/:serviceId/videos', protect, svc.getServiceVideos);
router.post('/admin/services/:serviceId/videos', protect, upload.single('video'), svc.addServiceVideo);
router.put('/admin/services/videos/:videoId', protect, upload.single('video'), svc.updateServiceVideo);
router.delete('/admin/services/videos/:videoId', protect, svc.deleteServiceVideo);

// Portfolio
router.get('/admin/projects', protect, port.getAllProjects);
router.get('/admin/projects/:id', protect, port.getProjectById);
router.post('/admin/projects', protect, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 20 }]), port.createProject);
router.put('/admin/projects/:id', protect, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 20 }]), port.updateProject);
router.delete('/admin/projects/:id', protect, port.deleteProject);

// Quick Shoots
router.get('/admin/quick-shoots', protect, gen.getAllQuickShoots);
router.post('/admin/quick-shoots', protect, upload.single('image'), gen.createQuickShoot);
router.put('/admin/quick-shoots/:id', protect, upload.single('image'), gen.updateQuickShoot);
router.delete('/admin/quick-shoots/:id', protect, gen.deleteQuickShoot);

// Quick Shoot Videos
router.get('/admin/quick-shoots/:quickShootId/videos', protect, gen.getQuickShootVideos);
router.post('/admin/quick-shoots/:quickShootId/videos', protect, upload.single('video'), gen.addQuickShootVideo);
router.put('/admin/quick-shoots/videos/:videoId', protect, upload.single('video'), gen.updateQuickShootVideo);
router.delete('/admin/quick-shoots/videos/:videoId', protect, gen.deleteQuickShootVideo);

// Partners (project partners, not accounts)
router.get('/admin/partners', protect, gen.getAllPartners);
router.post('/admin/partners', protect, upload.single('logo'), gen.createPartner);
router.put('/admin/partners/:id', protect, upload.single('logo'), gen.updatePartner);
router.delete('/admin/partners/:id', protect, gen.deletePartner);

// Enquiries
router.get('/admin/enquiries', protect, gen.getAllEnquiries);
router.get('/admin/enquiries/:id', protect, gen.getEnquiryById);
router.put('/admin/enquiries/:id', protect, gen.updateEnquiry);
router.delete('/admin/enquiries/:id', protect, gen.deleteEnquiry);

// Clients
router.get('/admin/clients', protect, gen.getAllClients);
router.post('/admin/clients', protect, upload.single('logo'), gen.createClient);
router.put('/admin/clients/:id', protect, upload.single('logo'), gen.updateClient);
router.delete('/admin/clients/:id', protect, gen.deleteClient);

// Testimonials
router.get('/admin/testimonials', protect, gen.getAllTestimonials);
router.post('/admin/testimonials', protect, upload.single('profileImage'), gen.createTestimonial);
router.put('/admin/testimonials/:id', protect, upload.single('profileImage'), gen.updateTestimonial);
router.delete('/admin/testimonials/:id', protect, gen.deleteTestimonial);

// Website Content + Stats
router.get('/admin/content', protect, gen.getWebsiteContent);
router.put('/admin/content/:section', protect, gen.updateWebsiteContent);
router.put('/admin/stats', protect, gen.updateManualStats);

// Brand
router.get('/admin/brand', protect, gen.getBrandSettings);
router.put('/admin/brand', protect, upload.single('logo'), gen.updateBrandSettings);

module.exports = router;

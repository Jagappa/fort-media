const Service = require('../models/Service');
const ServiceVideo = require('../models/ServiceVideo');

/* A service is now defined by its two names, its image and its order.
   The slug is no longer entered by hand — it is derived from the English
   name here, because the public detail route (/services/:slug), the card
   links and the website-development special case all still depend on it.

   description / shortDescription are no longer written by these handlers.
   The schema keeps them so existing records retain the copy they already
   have; nothing new is stored in them. */

const makeSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Slugs are unique in the schema, and the admin can no longer resolve a
 *  clash by hand — so two services named alike must not throw E11000. */
const uniqueSlug = async (source, excludeId) => {
  const root = makeSlug(source) || 'service';
  let slug = root;
  let n = 2;
  /* eslint-disable no-await-in-loop */
  while (await Service.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  /* eslint-enable no-await-in-loop */
  return slug;
};

// PUBLIC
exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort('displayOrder');
    res.json(services);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const videos = await ServiceVideo.find({ service: service._id, isActive: true }).sort('displayOrder');
    res.json({ service, videos });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ADMIN
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort('displayOrder');
    res.json(services);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const videos = await ServiceVideo.find({ service: service._id }).sort('displayOrder');
    res.json({ service, videos });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createService = async (req, res) => {
  try {
    const nameEn = String(req.body.nameEn || '').trim();
    const nameKn = String(req.body.nameKn || '').trim();

    if (!nameEn) return res.status(400).json({ message: 'English name is required.' });
    if (!nameKn) return res.status(400).json({ message: 'Kannada name is required.' });
    // The image *is* the card on the public site, so a service without one
    // would render as an empty tile.
    if (!req.file) return res.status(400).json({ message: 'Service image is required.' });

    const service = await Service.create({
      name: { en: nameEn, kn: nameKn },
      slug: await uniqueSlug(nameEn),
      mainImage: '/uploads/' + req.file.filename,
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== 'false',
      isFeatured: req.body.isFeatured === 'true',
    });
    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const update = {};

    // Names are only validated when the client is actually sending them —
    // the activate toggle and a lone image swap post nothing else.
    if (req.body.nameEn !== undefined) {
      const nameEn = String(req.body.nameEn || '').trim();
      const nameKn = String(req.body.nameKn || '').trim();
      if (!nameEn) return res.status(400).json({ message: 'English name is required.' });
      if (!nameKn) return res.status(400).json({ message: 'Kannada name is required.' });
      update.name = { en: nameEn, kn: nameKn };
      // The slug is deliberately left alone on rename: it is a public URL,
      // and regenerating it would break links already shared.
    }

    if (req.body.displayOrder !== undefined) update.displayOrder = Number(req.body.displayOrder) || 0;
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.isFeatured !== undefined) update.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.file) update.mainImage = '/uploads/' + req.file.filename;

    const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteService = async (req, res) => {
  try {
    await ServiceVideo.deleteMany({ service: req.params.id });
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// SERVICE VIDEOS — file upload only
exports.getServiceVideos = async (req, res) => {
  try {
    const videos = await ServiceVideo.find({ service: req.params.serviceId }).sort('displayOrder');
    res.json(videos);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addServiceVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please select a video file.' });
    const data = {
      service: req.params.serviceId,
      title: { en: req.body.titleEn || req.body.title || 'Untitled', kn: req.body.titleKn || '' },
      description: { en: req.body.descEn || '', kn: req.body.descKn || '' },
      videoFile: '/uploads/' + req.file.filename,
      videoType: 'upload',
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: true,
    };
    const video = await ServiceVideo.create(data);
    res.status(201).json(video);
  } catch (error) {
    console.error('Add service video error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateServiceVideo = async (req, res) => {
  try {
    const update = {};
    if (req.body.titleEn !== undefined) update.title = { en: req.body.titleEn, kn: req.body.titleKn || '' };
    if (req.body.descEn !== undefined) update.description = { en: req.body.descEn, kn: req.body.descKn || '' };
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.displayOrder !== undefined) update.displayOrder = Number(req.body.displayOrder);
    if (req.file) update.videoFile = '/uploads/' + req.file.filename;
    const video = await ServiceVideo.findByIdAndUpdate(req.params.videoId, update, { new: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteServiceVideo = async (req, res) => {
  try {
    await ServiceVideo.findByIdAndDelete(req.params.videoId);
    res.json({ message: 'Video deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

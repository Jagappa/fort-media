// =====================================================
// ENVIRONMENT
// =====================================================

const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
});

// =====================================================
// DNS FIX FOR MONGODB ATLAS
// =====================================================

const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
]);

dns.setDefaultResultOrder('ipv4first');

// =====================================================
// MONGOOSE
// =====================================================

const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const Service = require('../models/Service');
const QuickShoot = require('../models/QuickShoot');
const WebsiteContent = require('../models/WebsiteContent');
const BrandSettings = require('../models/BrandSettings');

// =====================================================
// SEED FUNCTION
// =====================================================

const seed = async () => {
  try {
    console.log('');
    console.log('======================================');
    console.log('       FORT MEDIA DATABASE SEED');
    console.log('======================================');
    console.log('');

    // Check MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is missing from the root .env file.'
      );
    }

    console.log('Connecting to MongoDB...');

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
    });

    console.log('✓ Connected to MongoDB');
    console.log('');

    // =================================================
    // ADMIN
    // =================================================

    const adminExists = await Admin.findOne({
      email: 'admin@fortmedia.in',
    });

    if (!adminExists) {
      await Admin.create({
        name: 'Fort Media Admin',
        email: 'admin@fortmedia.in',
        password: 'FortMedia@2024',
        role: 'superadmin',
      });

      console.log('✓ Admin created');
    } else {
      console.log('✓ Admin already exists');
    }

    // =================================================
    // SERVICES
    // =================================================

    const services = [
      {
        name: {
          en: 'Digital Marketing',
          kn: 'ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್',
        },
        slug: 'digital-marketing',
        shortDescription: {
          en: 'Build a strong online presence through strategic digital campaigns designed around visibility, engagement, leads, and business growth.',
          kn: 'ದೃಶ್ಯತೆ, ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ, ಲೀಡ್‌ಗಳು ಮತ್ತು ವ್ಯಾಪಾರ ಬೆಳವಣಿಗೆಯ ಸುತ್ತ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಕಾರ್ಯತಂತ್ರದ ಡಿಜಿಟಲ್ ಅಭಿಯಾನಗಳ ಮೂಲಕ ಬಲವಾದ ಆನ್‌ಲೈನ್ ಉಪಸ್ಥಿತಿಯನ್ನು ನಿರ್ಮಿಸಿ.',
        },
        displayOrder: 1,
      },

      {
        name: {
          en: 'Social Media Management',
          kn: 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ನಿರ್ವಹಣೆ',
        },
        slug: 'social-media-management',
        shortDescription: {
          en: 'Manage the complete social media presence including strategy, content planning, creative production, publishing, community engagement, and performance analysis.',
          kn: 'ಕಾರ್ಯತಂತ್ರ, ವಿಷಯ ಯೋಜನೆ, ಸೃಜನಾತ್ಮಕ ಉತ್ಪಾದನೆ, ಪ್ರಕಟಣೆ, ಸಮುದಾಯ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ಕಾರ್ಯಕ್ಷಮತೆ ವಿಶ್ಲೇಷಣೆ ಸೇರಿದಂತೆ ಸಂಪೂರ್ಣ ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಉಪಸ್ಥಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ.',
        },
        displayOrder: 2,
      },

      {
        name: {
          en: 'Content Production / Ad Shoots',
          kn: 'ವಿಷಯ ಉತ್ಪಾದನೆ / ಜಾಹೀರಾತು ಶೂಟ್‌ಗಳು',
        },
        slug: 'content-production',
        shortDescription: {
          en: 'Create professional visual content for advertisements, brands, products, campaigns, reels, promotional videos, and social media.',
          kn: 'ಜಾಹೀರಾತುಗಳು, ಬ್ರಾಂಡ್‌ಗಳು, ಉತ್ಪನ್ನಗಳು, ಅಭಿಯಾನಗಳು, ರೀಲ್ಸ್, ಪ್ರಚಾರ ವೀಡಿಯೊಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮಕ್ಕಾಗಿ ವೃತ್ತಿಪರ ದೃಶ್ಯ ವಿಷಯವನ್ನು ರಚಿಸಿ.',
        },
        displayOrder: 3,
      },

      {
        name: {
          en: 'Performance Marketing',
          kn: 'ಕಾರ್ಯಕ್ಷಮತೆ ಮಾರ್ಕೆಟಿಂಗ್',
        },
        slug: 'performance-marketing',
        shortDescription: {
          en: 'Run measurable advertising campaigns focused on leads, conversions, customer acquisition, and business growth.',
          kn: 'ಲೀಡ್‌ಗಳು, ಪರಿವರ್ತನೆಗಳು, ಗ್ರಾಹಕ ಸ್ವಾಧೀನ ಮತ್ತು ವ್ಯಾಪಾರ ಬೆಳವಣಿಗೆಯ ಮೇಲೆ ಕೇಂದ್ರೀಕೃತವಾದ ಅಳೆಯಬಹುದಾದ ಜಾಹೀರಾತು ಅಭಿಯಾನಗಳನ್ನು ನಡೆಸಿ.',
        },
        displayOrder: 4,
      },

      {
        name: {
          en: 'Personal Branding',
          kn: 'ವೈಯಕ್ತಿಕ ಬ್ರಾಂಡಿಂಗ್',
        },
        slug: 'personal-branding',
        shortDescription: {
          en: 'Build powerful personal brands for founders, entrepreneurs, professionals, creators, and public personalities.',
          kn: 'ಸಂಸ್ಥಾಪಕರು, ಉದ್ಯಮಿಗಳು, ವೃತ್ತಿಪರರು, ಸೃಷ್ಟಿಕರ್ತರು ಮತ್ತು ಸಾರ್ವಜನಿಕ ವ್ಯಕ್ತಿತ್ವಗಳಿಗಾಗಿ ಪ್ರಬಲ ವೈಯಕ್ತಿಕ ಬ್ರಾಂಡ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ.',
        },
        displayOrder: 5,
      },

      {
        name: {
          en: 'Website Development',
          kn: 'ವೆಬ್‌ಸೈಟ್ ಅಭಿವೃದ್ಧಿ',
        },
        slug: 'website-development',
        shortDescription: {
          en: 'Create modern websites that represent the brand professionally and turn visitors into customers.',
          kn: 'ಬ್ರಾಂಡ್ ಅನ್ನು ವೃತ್ತಿಪರವಾಗಿ ಪ್ರತಿನಿಧಿಸುವ ಮತ್ತು ಸಂದರ್ಶಕರನ್ನು ಗ್ರಾಹಕರನ್ನಾಗಿ ಪರಿವರ್ತಿಸುವ ಆಧುನಿಕ ವೆಬ್‌ಸೈಟ್‌ಗಳನ್ನು ರಚಿಸಿ.',
        },
        displayOrder: 6,
      },

      {
        name: {
          en: 'Quick Shoots',
          kn: 'ಕ್ವಿಕ್ ಶೂಟ್‌ಗಳು',
        },
        slug: 'quick-shoots',
        shortDescription: {
          en: 'Fast and professional content shoots for businesses, products, vehicles, properties, events, and individuals.',
          kn: 'ವ್ಯಾಪಾರಗಳು, ಉತ್ಪನ್ನಗಳು, ವಾಹನಗಳು, ಆಸ್ತಿಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವ್ಯಕ್ತಿಗಳಿಗಾಗಿ ವೇಗವಾದ ಮತ್ತು ವೃತ್ತಿಪರ ವಿಷಯ ಶೂಟ್‌ಗಳು.',
        },
        displayOrder: 7,
      },
    ];

    for (const service of services) {
      const exists = await Service.findOne({
        slug: service.slug,
      });

      if (!exists) {
        await Service.create(service);
        console.log(`✓ Service created: ${service.name.en}`);
      }
    }

    console.log('✓ Services ready');
    console.log('');

    // =================================================
    // QUICK SHOOTS
    // =================================================

    const shoots = [
      {
        name: {
          en: 'Car Shoot',
          kn: 'ಕಾರ್ ಶೂಟ್',
        },
        slug: 'car-shoot',
        description: {
          en: 'Professional photography and video content for cars, dealerships, owners, and automotive brands.',
          kn: 'ಕಾರುಗಳು, ಡೀಲರ್‌ಶಿಪ್‌ಗಳು, ಮಾಲೀಕರು ಮತ್ತು ಆಟೋಮೋಟಿವ್ ಬ್ರಾಂಡ್‌ಗಳಿಗಾಗಿ ವೃತ್ತಿಪರ ಫೋಟೋಗ್ರಫಿ ಮತ್ತು ವೀಡಿಯೊ ವಿಷಯ.',
        },
        displayOrder: 1,
      },

      {
        name: {
          en: 'Bike Shoot',
          kn: 'ಬೈಕ್ ಶೂಟ್',
        },
        slug: 'bike-shoot',
        description: {
          en: 'Cinematic bike photography and video content for riders, dealerships, and brands.',
          kn: 'ರೈಡರ್‌ಗಳು, ಡೀಲರ್‌ಶಿಪ್‌ಗಳು ಮತ್ತು ಬ್ರಾಂಡ್‌ಗಳಿಗಾಗಿ ಸಿನಿಮಾಟಿಕ್ ಬೈಕ್ ಫೋಟೋಗ್ರಫಿ ಮತ್ತು ವೀಡಿಯೊ ವಿಷಯ.',
        },
        displayOrder: 2,
      },

      {
        name: {
          en: 'House Opening',
          kn: 'ಮನೆ ಉದ್ಘಾಟನೆ',
        },
        slug: 'house-opening',
        description: {
          en: 'Professional photography and video coverage for housewarming and property opening events.',
          kn: 'ಗೃಹ ಪ್ರವೇಶ ಮತ್ತು ಆಸ್ತಿ ಉದ್ಘಾಟನಾ ಕಾರ್ಯಕ್ರಮಗಳಿಗಾಗಿ ವೃತ್ತಿಪರ ಫೋಟೋಗ್ರಫಿ ಮತ್ತು ವೀಡಿಯೊ ಕವರೇಜ್.',
        },
        displayOrder: 3,
      },

      {
        name: {
          en: 'Product Shoot',
          kn: 'ಉತ್ಪನ್ನ ಶೂಟ್',
        },
        slug: 'product-shoot',
        description: {
          en: 'High-quality product photography and short-form videos for businesses and brands.',
          kn: 'ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಬ್ರಾಂಡ್‌ಗಳಿಗಾಗಿ ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಉತ್ಪನ್ನ ಫೋಟೋಗ್ರಫಿ ಮತ್ತು ಚಿಕ್ಕ ವೀಡಿಯೊಗಳು.',
        },
        displayOrder: 4,
      },

      {
        name: {
          en: 'Event Shoot',
          kn: 'ಈವೆಂಟ್ ಶೂಟ್',
        },
        slug: 'event-shoot',
        description: {
          en: 'Fast event coverage for businesses, launches, celebrations, and promotional events.',
          kn: 'ವ್ಯಾಪಾರಗಳು, ಉಡಾವಣೆಗಳು, ಆಚರಣೆಗಳು ಮತ್ತು ಪ್ರಚಾರ ಕಾರ್ಯಕ್ರಮಗಳಿಗಾಗಿ ತ್ವರಿತ ಈವೆಂಟ್ ಕವರೇಜ್.',
        },
        displayOrder: 5,
      },

      {
        name: {
          en: 'Store / Business Shoot',
          kn: 'ಅಂಗಡಿ / ವ್ಯಾಪಾರ ಶೂಟ್',
        },
        slug: 'store-business-shoot',
        description: {
          en: 'Content for shops, restaurants, offices, showrooms, and local businesses.',
          kn: 'ಅಂಗಡಿಗಳು, ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು, ಕಛೇರಿಗಳು, ಶೋರೂಮ್‌ಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಗಳಿಗಾಗಿ ವಿಷಯ.',
        },
        displayOrder: 6,
      },

      {
        name: {
          en: 'Social Media Shoot',
          kn: 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಶೂಟ್',
        },
        slug: 'social-media-shoot',
        description: {
          en: 'Quick reels and social media content designed specifically for Instagram and other platforms.',
          kn: 'ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಮತ್ತು ಇತರ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳಿಗಾಗಿ ನಿರ್ದಿಷ್ಟವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಕ್ವಿಕ್ ರೀಲ್ಸ್ ಮತ್ತು ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ವಿಷಯ.',
        },
        displayOrder: 7,
      },
    ];

    for (const shoot of shoots) {
      const exists = await QuickShoot.findOne({
        slug: shoot.slug,
      });

      if (!exists) {
        await QuickShoot.create(shoot);
        console.log(`✓ Quick Shoot created: ${shoot.name.en}`);
      }
    }

    console.log('✓ Quick Shoots ready');
    console.log('');

    // =================================================
    // BRAND SETTINGS
    // =================================================

    const brandExists = await BrandSettings.findOne();

    if (!brandExists) {
      await BrandSettings.create({
        brandName: 'FORT MEDIA',

        tagline: {
          en: "We Don't Follow Trends. We Build Them.",
          kn: 'ನಾವು ಟ್ರೆಂಡ್‌ಗಳನ್ನು ಅನುಸರಿಸುವುದಿಲ್ಲ. ನಾವು ಅವುಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತೇವೆ.',
        },

        phone: '+91 XXXXX XXXXX',
        email: 'hello@fortmedia.in',
        location: 'Your City, India',
        instagram: '@fortmedia',
        whatsapp: '+91 XXXXX XXXXX',
      });

      console.log('✓ Brand Settings created');
    } else {
      console.log('✓ Brand Settings already exists');
    }

    // =================================================
    // WEBSITE CONTENT
    // =================================================

    const contentSections = [
      {
        section: 'hero',

        content: {
          en: {
            heading: "WE DON'T FOLLOW TRENDS.",
            headingAccent: 'WE BUILD THEM.',
            subtext:
              'Fort Media helps businesses, brands, creators, and individuals build attention, grow their presence online, and create content that demands to be seen.',
            ctaPrimary: "LET'S BUILD YOUR BRAND",
            ctaSecondary: 'VIEW OUR WORK',
          },

          kn: {
            heading: 'ನಾವು ಟ್ರೆಂಡ್‌ಗಳನ್ನು ಅನುಸರಿಸುವುದಿಲ್ಲ.',
            headingAccent: 'ನಾವು ಅವುಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತೇವೆ.',
            subtext:
              'ಫೋರ್ಟ್ ಮೀಡಿಯಾ ವ್ಯಾಪಾರಗಳು, ಬ್ರಾಂಡ್‌ಗಳು, ಸೃಷ್ಟಿಕರ್ತರು ಮತ್ತು ವ್ಯಕ್ತಿಗಳಿಗೆ ಗಮನ ಸೆಳೆಯಲು, ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಬೆಳೆಯಲು ಮತ್ತು ಪ್ರಬಲ ವಿಷಯವನ್ನು ರಚಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
            ctaPrimary: 'ನಿಮ್ಮ ಬ್ರಾಂಡ್ ನಿರ್ಮಿಸೋಣ',
            ctaSecondary: 'ನಮ್ಮ ಕೆಲಸ ನೋಡಿ',
          },
        },
      },

      {
        section: 'about',

        content: {
          en: {
            heading: "WE DON'T JUST CREATE CONTENT.",
            headingAccent: 'WE CREATE ATTENTION.',
            text:
              'Fort Media is a creative powerhouse that combines marketing, storytelling, production, social media, advertising, branding, and technology into one studio. We exist to make brands impossible to ignore.',

            stats: {
              projects: 'XX',
              brands: 'XX',
              campaigns: 'XX',
              contentPieces: 'XX',
            },
          },

          kn: {
            heading: 'ನಾವು ಕೇವಲ ವಿಷಯವನ್ನು ರಚಿಸುವುದಿಲ್ಲ.',
            headingAccent: 'ನಾವು ಗಮನ ಸೆಳೆಯುತ್ತೇವೆ.',
            text:
              'ಫೋರ್ಟ್ ಮೀಡಿಯಾ ಮಾರ್ಕೆಟಿಂಗ್, ಕಥೆ ಹೇಳುವಿಕೆ, ಉತ್ಪಾದನೆ, ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ, ಜಾಹೀರಾತು, ಬ್ರಾಂಡಿಂಗ್ ಮತ್ತು ತಂತ್ರಜ್ಞಾನವನ್ನು ಒಂದೇ ಸ್ಟುಡಿಯೋದಲ್ಲಿ ಸಂಯೋಜಿಸುವ ಸೃಜನಶೀಲ ಶಕ್ತಿಕೇಂದ್ರವಾಗಿದೆ.',

            stats: {
              projects: 'XX',
              brands: 'XX',
              campaigns: 'XX',
              contentPieces: 'XX',
            },
          },
        },
      },

      {
        section: 'contact',

        content: {
          en: {
            heading: "LET'S CREATE SOMETHING",
            headingAccent: 'PEOPLE REMEMBER.',
            subtext:
              "Whether you need digital marketing, social media management, an ad shoot, personal branding, a website, or a quick shoot — let's talk.",
            cta: "LET'S WORK TOGETHER",
          },

          kn: {
            heading: 'ಜನರು ನೆನಪಿಡುವಂಥದ್ದನ್ನು',
            headingAccent: 'ರಚಿಸೋಣ.',
            subtext:
              'ನಿಮಗೆ ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್, ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ನಿರ್ವಹಣೆ, ಜಾಹೀರಾತು ಶೂಟ್, ವೈಯಕ್ತಿಕ ಬ್ರಾಂಡಿಂಗ್, ವೆಬ್‌ಸೈಟ್, ಅಥವಾ ಕ್ವಿಕ್ ಶೂಟ್ ಬೇಕಾದರೆ — ಮಾತನಾಡೋಣ.',
            cta: 'ಒಟ್ಟಿಗೆ ಕೆಲಸ ಮಾಡೋಣ',
          },
        },
      },
    ];

    for (const section of contentSections) {
      await WebsiteContent.findOneAndUpdate(
        { section: section.section },
        section,
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log('✓ Website Content ready');
    console.log('');

    // =================================================
    // COMPLETE
    // =================================================

    console.log('======================================');
    console.log('          ✅ SEED COMPLETE');
    console.log('======================================');
    console.log('');
    console.log('Admin Login');
    console.log('Email:    admin@fortmedia.in');
    console.log('Password: FortMedia@2024');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('======================================');
    console.error('           ❌ SEED FAILED');
    console.error('======================================');
    console.error('');
    console.error(error);
    console.error('');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
  }
};

seed();
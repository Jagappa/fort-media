# FORT MEDIA — Full-Stack Creative Agency Platform

> **WE DON'T FOLLOW TRENDS. WE BUILD THEM.**

A premium, full-stack digital marketing & creative production platform built with React + TypeScript (frontend), Node.js + Express (backend), and MongoDB (database).

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18 + TypeScript + Vite  |
| Backend  | Node.js + Express.js          |
| Database | MongoDB + Mongoose            |
| Auth     | JWT (JSON Web Tokens)         |
| Uploads  | Multer (500MB max)            |
| Styling  | Custom CSS (dark theme)       |
| Animations | Framer Motion               |
| Fonts    | Bebas Neue, Inter, Noto Sans Kannada |

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (or MongoDB Atlas URI)

### 1. Clone / copy the project

```bash
cd fort-media
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
mkdir -p uploads
npm run seed   # Creates admin user + default data
npm start      # Runs on http://localhost:5000
```

**Default Admin Login:**
- Email: `admin@fortmedia.in`
- Password: `FortMedia@2024`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Runs on http://localhost:5173
```

### 4. Open in Browser

- **Public Website:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin/login

---

## Project Structure

```
fort-media/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── config/db.js       # MongoDB connection
│   │   ├── models/            # 12 Mongoose models
│   │   │   ├── Admin.js
│   │   │   ├── HomePage.js
│   │   │   ├── Service.js
│   │   │   ├── ServiceVideo.js
│   │   │   ├── QuickShoot.js
│   │   │   ├── PortfolioProject.js
│   │   │   ├── ProjectPartner.js
│   │   │   ├── Enquiry.js
│   │   │   ├── Client.js
│   │   │   ├── Testimonial.js
│   │   │   ├── WebsiteContent.js
│   │   │   └── BrandSettings.js
│   │   ├── controllers/       # Business logic
│   │   ├── routes/index.js    # All API routes
│   │   ├── middleware/        # Auth + Upload
│   │   └── seeds/seed.js      # Database seeder
│   └── uploads/               # Uploaded files
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # All routes
│   │   ├── api/index.ts       # API service layer
│   │   ├── context/           # Language + Auth
│   │   ├── pages/
│   │   │   ├── public/        # HomePage, ServiceDetail, ProjectDetail
│   │   │   └── admin/         # 12 admin dashboard pages
│   │   ├── components/admin/  # Admin layout
│   │   └── styles/global.css  # Complete theme
│   └── public/
│       └── fort-media-logo.png
│
└── README.md
```

---

## Features

### Public Website
- Cinematic hero with video background (admin-controlled)
- Infinite services marquee
- Portfolio grid with category cards
- 7 service cards linking to detail pages
- Service detail pages with unlimited video gallery
- Quick Shoots section (7 shoot types)
- Why Fort Media (6 reasons with scroll animations)
- Process timeline (4 steps)
- Client logos section
- Testimonials carousel
- Contact form → admin enquiries
- **English / Kannada** language switcher
- Smooth scroll animations (Framer Motion)
- Responsive (desktop, tablet, mobile)
- Film grain texture, parallax, premium feel

### Admin Dashboard
- Dashboard: stats overview + recent activity
- Home Page: upload/manage hero video
- Services: CRUD + unlimited video management per service
- Portfolio: CRUD projects with multi-image/video upload
- Quick Shoots: manage shoot types
- Partners: add/verify/reject/activate workflow
- Enquiries: view/filter/update status
- Clients: add logos, activate/deactivate
- Testimonials: add with EN/KN, ratings
- Website Content: edit hero/about/contact (EN + KN)
- Brand Settings: upload logo, manage contact/social info

### API Endpoints (55+)
- Public routes: GET services, projects, content, brand, clients, etc.
- Public POST: submit enquiry
- Admin routes: full CRUD for all 12 collections (JWT protected)

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fort-media
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Cloudinary — media storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=fort-media
```

### Media storage

Uploads go to Cloudinary when all three of `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are set, and the full
`https://` URL is stored in MongoDB. With any of them missing, files are
written to `backend/uploads` instead, so local development needs no
Cloudinary account. The server logs which mode is active on boot.

**Setting these in production is not optional.** Render's free plan gives
the service an ephemeral filesystem: everything under `backend/uploads` is
erased on every restart, redeploy and wake from sleep, while the database
keeps pointing at paths that no longer exist — which is exactly how
uploaded media silently turns into broken images.

---

## Brand Identity

- **Colors:** Black (#0A0A0A) / White (#FFFFFF) / Red (#DC2626)
- **Display Font:** Bebas Neue
- **Body Font:** Inter
- **Kannada Font:** Noto Sans Kannada
- **Logo:** Replace via Admin → Brand Settings

---

## License

Private — Fort Media.

🛍️ Productr
Enterprise-Grade Product Management & Inventory Control System
https://react.dev
https://tailwindcss.com
https://nodejs.org
https://mongodb.com

A production-ready, full-stack inventory management solution engineered for scalability and security. Productr delivers complete autonomy over your product catalog through a modern, reactive interface backed by a robust custom architecture.
✨ Core Capabilities
🔐 Enterprise Security

Feature	Implementation
Authentication	JWT-based stateless sessions with bcryptjs hashing
Multi-Factor Verification	Pluggable architecture for Email & SMS verification
Rate Limiting	Brute-force protection & API throttling
HTTP Security	helmet headers & configured CORS policies
📦 Inventory Management
Full CRUD Lifecycle — Intuitive creation, editing, and archival workflows
Publish Control — Draft/published state management for content moderation
Schema Validation — Server-side integrity enforcement via Mongoose
Real-time Updates — Optimistic UI with immediate feedback
🎨 Modern Frontend Architecture
Blazing Performance — Vite-powered HMR with React 19 concurrent features
Responsive Design — Mobile-first Tailwind CSS v4 implementation
State Management — Context API for global auth state
UX Excellence — Framer Motion transitions & toast notifications
🏗️ Technical Architecture
Frontend Stack

Framework:     React 19 (Concurrent Rendering)
Build Tool:    Vite 5 (ESM Native)
Styling:       Tailwind CSS 4 (Utility-First)
Routing:       React Router DOM 7 (Data APIs)
State:         React Context + Hooks
Backend Stack

Runtime:       Node.js 18+ LTS
Framework:     Express.js 4
Database:      MongoDB 6+ (Document Store)
ODM:           Mongoose 8
Auth:          JWT (RS256/HS256) + Bcryptjs
Security:      Helmet, CORS, Express-Rate-Limit
🚀 Quick Start
Prerequisites
Node.js v18.x or higher (Download)
MongoDB instance (Local or Atlas URI)
1. Repository Setup

git clone https://github.com/your-username/productr.git
cd productr
2. Backend Configuration

cd Backend
npm install
Create Backend/.env:
env

# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MongoDB atlas =  Cluster 
# Security
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

Start development server:
bash
Copy
npm run dev  # Nodemon + Hot Reload
3. Frontend Initialization
bash
Copy
cd ../Frontend
npm install
npm run dev
Access Points:
🌐 Client: http://localhost:5173
⚙️ API: http://localhost:3000/api
productr/
├── 📁 Backend/
│   ├── 📁 config/          # Database & environment configuration
│   ├── 📁 controllers/     # Route business logic
│   ├── 📁 middleware/      # Auth, validation, error handling
│   ├── 📁 models/          # Mongoose schemas (User, Product, Category)
│   ├── 📁 routes/          # API endpoint definitions
│   ├── 📁 utils/           # Helper functions & email service
│   └── 📄 server.js        # Application entry point
│
├── 📁 Frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # Reusable UI (Button, Modal, DataTable)
│   │   ├── 📁 contexts/    # AuthProvider, ThemeProvider
│   │   ├── 📁 hooks/       # Custom React hooks (useAuth, useFetch)
│   │   ├── 📁 pages/       # Route components (Dashboard, Inventory)
│   │   ├── 📁 services/    # API client & interceptors
│   │   └── 📁 utils/       # Formatters & validators
│   ├── 📄 index.html       # Vite entry
│   └── 📄 tailwind.config.js
│
└── 📄 README.md
🔧 Environment Variables Reference

Variable	Required	Description	Example
PORT	Yes	API server port	3000
MONGODB_URI	Yes	MongoDB connection = mongoDB Cluster
JWT_SECRET	Yes	256-bit encryption key	super-secret-jwt-key-2024
JWT_EXPIRES_IN	No	Token lifespan	7d
FRONTEND_URL	No	CORS whitelist	http://localhost:5173
📜 API Documentation
Authentication Endpoints
http
Copy
POST   /api/auth/register     # User registration
POST   /api/auth/login        # Session initiation
POST   /api/auth/verify-email  # 2FA verification
POST   /api/auth/refresh      # Token rotation
Product Endpoints
http
Copy
GET    /api/products          # List (paginated, filterable)
POST   /api/products          # Create new product
GET    /api/products/:id      # Retrieve single
PATCH  /api/products/:id      # Update fields
DELETE /api/products/:id      # Soft delete
PUT    /api/products/:id/toggle-publish  # Visibility toggle
🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open a Pull Request

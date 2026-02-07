# Kantor Maks

> Modern web application for currency exchange office with admin panel and rate updates.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE.md)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

**Website:** [kantormaks.pl](https://kantormaks.pl)

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#-architecture)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running](#-running)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API](#-api)
- [Security](#-security)
- [Development](#-development)

## 🎯 About

**Kantor Maks** is a comprehensive web solution for a currency exchange office. The application consists of three main components:

### 1. 🌐 **Public Website** (Fastify + Handlebars)
A fast, server-side rendered website that displays current exchange rates to customers. Features include:
- Currencies rate display
- Responsive mobile-first design
- Location and contact information
- Opening hours

### 2. 🔐 **Admin Panel** (Protected by Basic Auth)
A secure administrative interface for managing currency rates:
- Basic Authentication protected
- Rate editing
- Instant updates propagated to the public site
- Form validation with user-friendly error messages
- Success/error toast notifications
- Clean, intuitive UI for quick updates

### 3. 📡 **REST API** (json-server based)
A lightweight JSON-based REST API that serves as the data layer:
- **Full CRUD operations** on currency rates (GET, POST, PUT, PATCH, DELETE)
- **JSON Schema validation** using Ajv - ensures data integrity
- **Authentication middleware** - write operations require Basic Auth
- **Automatic validation** - all POST/PUT/PATCH requests validated against schemas
- **RESTful design** - follows REST best practices
- **File-based database** - uses db.json for simple deployment
- **Middleware pipeline**:
  1. Authorization check (for write operations)
  2. JSON Schema validation (for data modifications)
  3. Route handling (CRUD operations)

The project uses a **monorepo architecture** with Lerna, enabling efficient management of multiple related packages with shared development tools and dependencies.

## ✨ Features

### 🌐 Public Website
- 📊 Display current buy and sell exchange rates
- 📱 Responsive design (mobile-first)
- 🕐 Opening hours information
- 📍 Location and contact details
- ⚡ Fast loading thanks to LightningCSS

### 🔐 Admin Panel
- 🔒 Secured with Basic Authentication
- ✏️ Currency rate editing
- ✅ Input data validation
- 📝 Confirmations and error messages
- 🎨 Intuitive user interface

### 🔧 Technical Features
- 🔄 Auto-refresh data without page reload
- 🛡️ Client-side and server-side validation
- 📦 RESTful API
- 🧪 End-to-end tests with Playwright
- 🎭 Visual regression testing with Percy
- 🔍 ESLint + Prettier for code quality
- 🪝 Git hooks with Husky and lint-staged

## 🏗️ Architecture

The project uses a **monorepo** managed by **Lerna** and consists of two main packages:

```
kantormaks/
├── packages/
│   ├── api/          # Backend - JSON Server API
│   └── website/      # Frontend - Fastify + Handlebars
└── package.json      # Root workspace
```

### API Architecture

The API package is built on **json-server** with custom middleware layers:

```javascript
// Request Pipeline
HTTP Request
    ↓
[1] JSON Server Defaults (CORS, body parser)
    ↓
[2] Authorization Middleware
    │   ├─ Check if auth required (POST/PUT/PATCH/DELETE)
    │   ├─ Validate Basic Auth credentials
    │   └─ Return 401 if unauthorized
    ↓
[3] Validation Middleware
    │   ├─ Check if validation required (POST/PUT/PATCH)
    │   ├─ Load JSON Schema for operation
    │   ├─ Validate request body with Ajv
    │   └─ Return 400 with errors if invalid
    ↓
[4] JSON Server Router (CRUD operations)
    ↓
db.json (File-based database)
```

**Validation Schemas:**
- `validation/schemas/rate/post.json` - New rate creation
- `validation/schemas/rate/put.json` - Full rate update
- `validation/schemas/rate/patch.json` - Partial rate update

Each schema enforces:
- Required fields (typeId, country, currency, purchase, sale)
- Data types (integers, numbers, strings)
- Format validation (date-time for timestamps)
- No additional properties allowed

## 📦 Requirements

- **Node.js** >= 24.x (see `.nvmrc`)
- **npm** >= 11.x
- **Git**
- **Nginx** (for production deployment)

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/dawid-drelichowski/kantormaks.git
cd kantormaks
```

### 2. Use Correct Node.js Version
```bash
# If using nvm:
nvm install
nvm use
```

### 3. Install Dependencies
```bash
npm ci
```

This command automatically installs dependencies for all packages in the workspace.

## ⚙️ Configuration

### Environment Variables

#### API (`packages/api/.env`)
```env
API_PORT=8080

# IMPORTANT: Change default credentials before deployment!
API_USER=your_secure_username
API_PASSWORD=your_secure_password
```

#### Website (`packages/website/.env`)
```env
WEBSITE_PORT=3001
WEBSITE_HOST=::
WEBSITE_LOCALE=pl-PL

WEBSITE_URL=http://localhost:3001

# Admin credentials
WEBSITE_ADMIN_USER=your_admin_username
WEBSITE_ADMIN_PASSWORD=your_admin_password

# API connection
WEBSITE_API_URL=http://localhost:8080
WEBSITE_API_USER=your_api_username
WEBSITE_API_PASSWORD=your_api_password

# Google verification (optional)
GOOGLE_SITE_VERIFICATION=your_google_verification_code
```

### Database Setup

```bash
# Copy dump to working file
cp packages/api/db.dump.json packages/api/db.json
```

### Nginx Configuration (Production)

Since the application runs behind Nginx, security features should be configured at the proxy level:

```nginx
# /etc/nginx/sites-available/kantormaks.pl

upstream kantormaks_website {
    server 127.0.0.1:3001;
    keepalive 64;
}

upstream kantormaks_api {
    server 127.0.0.1:8080;
    keepalive 64;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=60r/m;

server {
    listen 80;
    server_name kantormaks.pl www.kantormaks.pl;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kantormaks.pl www.kantormaks.pl;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/kantormaks.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kantormaks.pl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Admin panel with strict rate limiting
    location /admin {
        limit_req zone=admin_limit burst=3 nodelay;

        proxy_pass http://kantormaks_website;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;

        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin "https://kantormaks.pl" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }

        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://kantormaks_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files with caching
    location /public/ {
        proxy_pass http://kantormaks_website;
        proxy_http_version 1.1;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Main website
    location / {
        limit_req zone=general_limit burst=20 nodelay;

        proxy_pass http://kantormaks_website;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/kantormaks_access.log;
    error_log /var/log/nginx/kantormaks_error.log warn;
}
```

**Key Nginx Features:**
- ✅ **SSL/TLS termination** - HTTPS handled by Nginx
- ✅ **Security headers** - CSP, HSTS, X-Frame-Options, etc.
- ✅ **Rate limiting** - Different limits for admin, API, and general traffic
- ✅ **CORS** - Configured at proxy level
- ✅ **Compression** - Gzip for faster loading
- ✅ **Caching** - Static files cached for performance

## 🏃 Running

### Development Mode (Hot Reload)

```bash
# Run all services in development mode
npm run dev
```

This starts:
- **API** at http://localhost:8080
- **Website** at http://localhost:3001

### Production Mode

```bash
# Build assets
npm run assets:build -w packages/website

# Start services
npm start
```

### Running Single Package

```bash
# API only
npm run dev -w packages/api

# Website only
npm run dev -w packages/website
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### End-to-End Tests (Playwright)
```bash
# In website package
npm test -w packages/website

# With visual testing (Percy)
PERCY_TOKEN=your_percy_token npx percy exec -- npm test -w packages/website
```

### Linting
```bash
# Check all files
npm run lint

# Auto-fix
npm run lint -- --fix
```

### Code Formatting
```bash
npm run format
```

## 🚢 Deployment

### Production Preparation

1. **Create `.env` files with secure credentials**

2. **Build assets:**
   ```bash
   npm run assets:build -w packages/website
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Configure Nginx** (see [Nginx Configuration](#nginx-configuration-production))

6. **Setup SSL certificates:**
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d kantormaks.pl -d www.kantormaks.pl
   ```

### GitHub Actions CI/CD

The project uses automated workflows:

- **Linting** - on every push/PR
- **Testing** - on every push/PR to main
- **Dependabot** - weekly dependency updates

See `.github/workflows/` for details.

## 🔌 API

### Base URL
```
Production: https://kantormaks.pl/api
Development: http://localhost:8080
```

### Endpoints

#### GET /rates
Get all exchange rates.

**Response:**
```json
{
  "rates": [
    {
      "id": 1,
      "typeId": 1,
      "timestamp": "2024-02-07T10:00:00Z",
      "country": "United States",
      "currency": "USD",
      "purchase": 4.05,
      "sale": 4.15
    }
    // ...
  ]
}
```

#### GET /rates/:id
Get specific rate by ID.

**Response:**
```json
{
  "id": 1,
  "typeId": 1,
  "timestamp": "2024-02-07T10:00:00Z",
  "country": "United States",
  "currency": "USD",
  "purchase": 4.05,
  "sale": 4.15
}
```

**404 Response (rate not found):**
```json
{}
```

#### POST /rates
Create new rate.

**Requires authorization:** Basic Auth

**Request Body:**
```json
{
  "typeId": 1,
  "country": "Japan",
  "currency": "JPY",
  "purchase": 0.027,
  "sale": 0.029,
  "timestamp": "2024-02-07T10:00:00Z"  // optional
}
```

**Required fields:**
- `typeId` (integer) - Rate type identifier
- `country` (string) - Country name
- `currency` (string) - Currency code
- `purchase` (number) - Buy rate
- `sale` (number) - Sell rate

**Optional fields:**
- `timestamp` (string, ISO 8601 date-time) - Rate timestamp

**Success Response (201 Created):**
```json
{
  "id": 21,
  "typeId": 1,
  "country": "Japan",
  "currency": "JPY",
  "purchase": 0.027,
  "sale": 0.029,
  "timestamp": "2024-02-07T10:00:00Z"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "error": "data must have required property 'currency', data must have required property 'purchase'"
}
```

#### PUT /rates/:id
Update rate (full replacement).

**Requires authorization:** Basic Auth

**Request Body:** Same as POST (all required fields must be provided)

#### PATCH /rates/:id
Partial rate update.

**Requires authorization:** Basic Auth

**Request Body:**
```json
{
  "purchase": 4.10,
  "sale": 4.20
}
```

You can update any subset of fields (typeId, country, currency, purchase, sale, timestamp).

#### DELETE /rates/:id
Delete rate.

**Requires authorization:** Basic Auth

**Success Response (200 OK):**
```json
{}
```

**404 Response (rate not found):**
```json
{}
```

### Authentication

The API uses **Basic Authentication** for modifying operations (POST, PUT, PATCH, DELETE).

**Header:**
```
Authorization: Basic base64(username:password)
```

**Example (curl):**
```bash
# Create new rate
curl -X POST https://kantormaks.pl/api/rates \
  -u admin:password \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": 1,
    "country": "Japan",
    "currency": "JPY",
    "purchase": 0.027,
    "sale": 0.029
  }'

# Update rate
curl -X PATCH https://kantormaks.pl/api/rates/1 \
  -u admin:password \
  -H "Content-Type: application/json" \
  -d '{
    "purchase": 4.10,
    "sale": 4.20
  }'

# Delete rate
curl -X DELETE https://kantormaks.pl/api/rates/1 \
  -u admin:password
```

### Error Responses

#### 401 Unauthorized
Missing or invalid authentication credentials.

```json
{
  "error": "Unauthorized"
}
```

#### 400 Bad Request
Validation failed - request body doesn't match schema.

```json
{
  "error": "data must have required property 'currency'"
}
```

Common validation errors:
- Missing required fields
- Invalid data types (string instead of number)
- Invalid timestamp format (must be ISO 8601)
- Additional properties not allowed

#### 404 Not Found
Rate with specified ID doesn't exist.

```json
{}
```

### Validation Rules

All POST/PUT/PATCH requests are validated using **JSON Schema** with **Ajv**.

**Schema location:** `packages/api/validation/schemas/rate/`

**POST/PUT Required Fields:**
```javascript
{
  typeId: integer,    // Rate type ID
  country: string,    // Country name
  currency: string,   // Currency code (e.g., "USD", "EUR")
  purchase: number,   // Buy rate (decimal)
  sale: number        // Sell rate (decimal)
}
```

**Optional Fields:**
```javascript
{
  id: integer,              // Auto-generated if not provided
  timestamp: string         // ISO 8601 date-time (e.g., "2024-02-07T10:00:00Z")
}
```

**PATCH Accepted Fields:**
Any subset of the above fields.

**Additional Properties:**
Not allowed - schema will reject any extra fields not defined above.

## 🔒 Security

### Application Behind Nginx

Since this application runs behind Nginx reverse proxy, most security features are handled at the proxy level:

**✅ Handled by Nginx:**
- SSL/TLS termination and certificate management
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting (admin, API, general traffic)
- CORS configuration
- Gzip compression
- DDoS protection
- Request filtering

**✅ Handled by Application:**
- Input validation (Ajv schemas)
- Authentication (Basic Auth)
- Authorization logic
- Data sanitization
- Error handling

### Vulnerability Reporting

If you discover a security issue, please contact the author:
- Email: [dawid.drelichowski@gmail.com]
- **DO NOT** create public issues for security problems

## 👨‍💻 Development

### Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/kantormaks.git
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/awesome-feature
   ```

3. **Make Changes**
   - Code will be automatically linted on commit (Husky + lint-staged)

4. **Test**
   ```bash
   npm test
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "Add awesome feature"
   ```

6. **Push & Pull Request**
   ```bash
   git push origin feature/awesome-feature
   ```

### Code Style

- **JavaScript:** ES6+ modules
- **Formatting:** Prettier (automatic on commit)
- **Linting:** ESLint (config: `eslint.config.js`)
- **EditorConfig:** See `.editorconfig`

### Pre-commit Hooks

Husky + lint-staged automatically:
- Checks linting
- Formats code


## 👤 Author

**Dawid Drelichowski**

- GitHub: [@dawid-drelichowski](https://github.com/dawid-drelichowski)

**Questions? Issues?** Open an [issue](https://github.com/dawid-drelichowski/kantormaks/issues) on GitHub!

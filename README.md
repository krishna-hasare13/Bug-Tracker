# Bug Tracker

A full-stack bug tracking and project management application built with React, Node.js, and Supabase.

## Project Overview

Bug Tracker is a collaborative project management system that allows teams to:
- Create and manage projects
- Track issues/bugs with detailed tickets
- Assign tickets to team members
- Add comments and collaborate on solutions
- Manage user roles and permissions
- Filter and organize tickets by status

**Tech Stack:**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **HTTP Client:** Axios

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │    Projects      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────┐   │ id (PK)          │
│ email           │     │   │ name             │
│ full_name       │     │   │ description      │
│ role            │     │   │ created_by (FK)  │
│ created_at      │     │   │ created_at       │
└─────────────────┘     │   └──────────────────┘
                        │          │
                        │          │ (1:N)
                        │          │
                        │   ┌──────▼───────────┐
                        └───│    Tickets       │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ project_id (FK)  │
                            │ title            │
                            │ description      │
                            │ status           │
                            │ priority         │
                            │ assigned_to (FK) │
                            │ created_by (FK)  │
                            │ created_at       │
                            └──────┬───────────┘
                                   │
                                   │ (1:N)
                                   │
                            ┌──────▼────────────┐
                            │    Comments      │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ ticket_id (FK)   │
                            │ user_id (FK)     │
                            │ content          │
                            │ created_at       │
                            └──────────────────┘
```

---

## Validations

### Frontend Validations (React)
- **Email Format:** RFC 5322 standard email validation
- **Password Strength:** Minimum 6 characters
- **Required Fields:** All form inputs are required before submission
- **Project Name:** Non-empty string, max 255 characters
- **Ticket Title:** Non-empty string, max 255 characters
- **Ticket Priority:** Enum validation (low, medium, high, critical)
- **Ticket Status:** Enum validation (open, in-progress, closed, resolved)

### Backend Validations (Express)
- **Email Uniqueness:** Prevents duplicate email registration
- **Authorization Headers:** JWT token validation
- **User ID Validation:** Ensures user exists in database
- **Project Ownership:** Validates user has access to project
- **Ticket Ownership:** Validates user can modify ticket
- **Input Sanitization:** All inputs trimmed and validated

---

## Permissions & Protections

### Role-Based Access Control (RBAC)

| Role | Projects | Tickets | Comments | Users |
|------|----------|---------|----------|-------|
| **Admin** | Create, Read, Update, Delete | Full Access | Full Access | Manage All |
| **Manager** | Create, Read, Update (own) | Assign, Update, Delete (own) | Create, Delete (own) | View All |
| **Developer** | Read (assigned) | Create, Update (own), Comment | Create, Delete (own) | View All |
| **User** | Read (assigned) | View, Comment | Create, Delete (own) | View Profile |

### Security Protections

**Authentication:**
- Supabase JWT-based authentication
- Secure password hashing (bcrypt)
- Email verification on signup
- Automatic session timeout

**Authorization:**
- Middleware-based role verification (`roleMiddleware.js`)
- User ID validation on all protected routes
- Project-level access control
- Ticket-level access control

**Data Protection:**
- CORS enabled (configurable origins)
- HTTPS enforced in production
- Sensitive data excluded from responses
- SQL injection prevention via parameterized queries

**API Security:**
- Authentication required for all protected endpoints
- Rate limiting recommended (not yet implemented)
- Input validation on all endpoints
- Request body size limits

---

## Installation & Running Locally

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project setup

### Environment Setup

Create `.env` files for configuration:

**Server `.env` (server/.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
```

**Client `.env` (client/.env):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001/api
```

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Bug Tracker
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   cd ..
   ```

4. **Set up Supabase:**
   - Create tables: users, projects, tickets, comments
   - Configure authentication providers
   - Set up Row Level Security (RLS) policies

5. **Run the development servers:**

   **Terminal 1 - Start Backend:**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3001
   ```

   **Terminal 2 - Start Frontend:**
   ```bash
   cd client
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

6. **Access the application:**
   - Open `http://localhost:5173` in your browser
   - Register a new account or login
   - Start creating projects and tracking bugs

### Available Scripts

**Server:**
- `npm start` - Run production server
- `npm run dev` - Run with nodemon (auto-reload)

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

---

## Live Deployment

### Prerequisites
- Vercel account (frontend)
- Heroku/Railway/Render account (backend)
- Supabase project

### Deploy to Vercel (Frontend)

1. **Connect repository to Vercel:**
   ```bash
   vercel --prod
   ```
   Or use Vercel Dashboard → Import Project

2. **Configure environment variables in Vercel:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
   - `VITE_API_BASE_URL` (production backend URL)

3. **Deploy:**
   - Vercel automatically deploys on push to main branch
   - Configuration in `vercel.json` handles routing

### Deploy to Railway/Render (Backend)

1. **Connect repository to Railway/Render**

2. **Configure environment variables:**
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `NODE_ENV=production`
   - `PORT=3001` (auto-assigned by platform)

3. **Deploy:**
   - Platform auto-deploys on push to main branch
   - Ensure `package.json` has start script

### Database Migration (Production)

1. **Backup existing data** (if migrating)
2. **Run migrations** on production Supabase project
3. **Test all endpoints** in staging environment
4. **Monitor logs** after deployment

---

## Project Structure

```
Bug Tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (Auth)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & Role middleware
│   ├── routes/            # API routes
│   ├── config/            # Supabase config
│   ├── server.js
│   └── package.json
│
└── README.md              # This file
```

---

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**CORS errors:**
- Check backend CORS configuration
- Verify `VITE_API_BASE_URL` matches backend URL

**Supabase connection issues:**
- Verify environment variables
- Check Supabase project is active
- Confirm RLS policies allow operations

**Authentication issues:**
- Clear browser localStorage
- Check JWT token expiration
- Verify Supabase auth configuration

---

## API Endpoints

**Base URL:** `http://localhost:3001/api`

### Auth Routes
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Project Routes
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Ticket Routes
- `GET /tickets` - Get all tickets
- `POST /tickets` - Create ticket
- `GET /tickets/:id` - Get ticket details
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

### Comment Routes
- `GET /comments/:ticketId` - Get ticket comments
- `POST /comments` - Add comment
- `DELETE /comments/:id` - Delete comment

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues or questions, please open an issue in the repository.

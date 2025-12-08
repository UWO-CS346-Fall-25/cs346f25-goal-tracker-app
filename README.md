# Goal Tracking App

A modern, secure web application built with Node.js, Express, EJS, and Supabase for managing and tracking personal goals.

**Authors:** Zafeer Rahim & Taylor Showalter

---

## 1. Project Overview

### Purpose

The Goal Tracker App is a full-stack web application designed to help users set, organize, and track personal goals. Users can create new goals, monitor progress, and manage their objectives in an intuitive, secure environment. The application leverages Supabase for cloud-hosted PostgreSQL database and built-in authentication infrastructure.

### Key Features

- 🎯 **Goal Management** - Create, edit, and delete personal goals
- 📊 **Progress Tracking** - Monitor goal status and updates
- 🔐 **User Authentication** - Secure login and registration via Supabase Auth
- 🔒 **Security First** - CSRF protection, secure sessions, parameterized queries
- 📱 **Responsive Design** - Clean, modern user interface
- ☁️ **Cloud Database** - PostgreSQL hosted on Supabase with automatic backups
- 🚀 **Performance** - Fast, lightweight backend built with Express.js

### Technology Stack

- **Backend:** Node.js 20, Express 4
- **Frontend:** EJS templating, Vanilla HTML/CSS/JavaScript
- **Database:** PostgreSQL (hosted on Supabase)
- **Authentication:** Supabase Auth
- **Security:** Helmet, CSRF protection, express-session for secure cookies
- **ORM/Query Builder:** Supabase JavaScript SDK (supabase-js)
- **Development Tools:** ESLint, Prettier, Nodemon

---

## 2. Technical Architecture

### MVC Pattern with Supabase

**MVC (Model-View-Controller)** is an architectural pattern that separates an application into three interconnected components:

- **Model**: Handles data and business logic (Supabase database operations, validation)
- **View**: Displays data to users (EJS templates, user interface)
- **Controller**: Processes requests and connects models to views (request handling, business logic coordination)

This separation of concerns makes the codebase easier to maintain, test, and extend.

### How This Project Implements MVC

```
Browser Request
    ↓
Express Middleware (Helmet, Sessions, CSRF)
    ↓
Routes (src/routes/)
    ↓
Controllers (src/controllers/)
    ↓
Models (src/models/) → Supabase SDK
    ↓
Supabase API → PostgreSQL Database
    ↓
Models (return data)
    ↓
Controllers (format response)
    ↓
Views (src/views/)
    ↓
HTML Response to Browser
```

### Request Flow in Detail

#### Step 1: Routes
Routes define URL patterns and map them to controller functions. Authentication middleware protects certain routes.

```javascript
// src/routes/goals.js
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, goals.list);     // Protected route
router.get('/:id', requireAuth, goals.show);  // Protected route
router.post('/', requireAuth, goals.create);  // Protected route
```

#### Step 2: Controllers
Controllers receive requests, validate input, call model methods via Supabase, and render views.

```javascript
// src/controllers/goalController.js
exports.list = async (req, res, next) => {
  try {
    const goals = await Goal.allByUser();  // Calls Supabase query
    res.render('goals/index', { goals });
  } catch (error) {
    next(error);  // Pass to error handler middleware
  }
};
```

#### Step 3: Models
Models interact with the Supabase API to perform CRUD operations. The Supabase SDK handles all database communication.

```javascript
// src/models/goals.js
const { supabase } = require('./supabaseClient');

exports.allByUser = async () => {
  const { data, error } = await supabase
    .from('newgoal')           // Table name
    .select('*')                // Select all columns
    .order('due', { ascending: true });

  if (error) throw error;
  return data ?? [];
};
```

**Key Differences from Traditional PostgreSQL:**
- No direct SQL queries to a local database connection
- Supabase SDK handles all communication via HTTPS REST API
- Automatic parameterization prevents SQL injection
- Real-time subscriptions possible (not currently used)

#### Step 4: Views
Views are EJS templates that render the data from controllers as HTML.

```html
<!-- src/views/goals/index.ejs -->
<h1>Your Goals</h1>
<% goals.forEach(goal => { %>
  <div class="goal-card">
    <h3><%= goal.goalname %></h3>
    <p><%= goal.description %></p>
    <p>Due: <%= goal.due %></p>
  </div>
<% }); %>
```

### Authentication Flow with Supabase Auth

Supabase provides two layers of authentication:

1. **Supabase Auth Layer** - Cloud-hosted user management
   - Handles registration with email/password
   - Manages password hashing and storage
   - Generates user IDs

2. **Session Layer** - Express session management
   - Stores user session in server (express-session)
   - Uses secure, httpOnly cookies to maintain session
   - Protects routes with `requireAuth` middleware

```javascript
// src/controllers/userController.js
exports.postRegister = async (req, res, next) => {
  try {
    const { email, display_name, password } = req.body;

    // 1. Create user in Supabase Auth (handles password hashing)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: display_name } },
    });

    if (error) throw error;

    // 2. Create user profile in public.users table (synced with auth.users)
    const existing = await User.findById(data.user.id);
    if (!existing) {
      await User.createProfile({ 
        id: data.user.id, 
        email, 
        username: display_name 
      });
    }

    // 3. Create Express session to keep them logged in
    req.session.user = { 
      id: data.user.id, 
      email, 
      display_name 
    };
    req.session.save(() => res.redirect('/dashboard'));
  } catch (error) {
    next(error);
  }
};
```

### Middleware & Security

All requests pass through middleware that:
1. **Helmet** - Sets security headers (XSS, MIME sniffing protection, etc.)
2. **Session Management** - Loads/saves user session from secure cookies
3. **CSRF Protection** - Validates tokens on state-changing requests
4. **Body Parsing** - Parses JSON and form data
5. **Authentication** - Middleware functions check if user is logged in

```javascript
// src/app.js
app.use(helmet());  // Security headers
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));
app.use(csrf());  // CSRF protection
```

---

## 3. Local Setup Instructions

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org)
- **Supabase Account** - [Create Free Account](https://supabase.com)
- **Git** - [Download](https://git-scm.com)

### Setup Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/UWO-CS346-Fall-25/cs346f25-goal-tracker-app.git
cd cs346f25-goal-tracker-app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Set Up Supabase Project

If you don't have a Supabase account:
- Go to [https://supabase.com](https://supabase.com)
- Click "Start your project"
- Create a new organization and project
- Choose PostgreSQL as your database
- Wait for the project to initialize (2-3 minutes)

#### 4. Configure Environment Variables

In your Supabase project dashboard:
- Go to **Settings** → **API** in the left sidebar
- Copy your **Project URL** and **anon public key**

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Server Configuration
NODE_ENV=development
PORT=3000

# Session Configuration
SESSION_SECRET=your-random-secret-key-change-this-in-production

# Optional: Only needed if using direct PostgreSQL connection (not currently used)
# DATABASE_URL=postgresql://user:password@host:port/database
```

> **Important**: The `.env.example` file in the repository is outdated and contains old PostgreSQL credentials that are not used. Use the template above instead.

#### 5. Create Database Tables in Supabase

You **must** create the required tables manually in the Supabase dashboard. Follow these steps:

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL, then click **Run**:

```sql
-- Create users table (linked to Supabase Auth)
CREATE TABLE public.users (
  id UUID NOT NULL,
  display_name TEXT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  email CHARACTER VARYING NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create goals table (with user association)
CREATE TABLE public.newgoal (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  goalname TEXT NULL,
  description TEXT NULL,
  due DATE NULL,
  CONSTRAINT newgoal_pkey PRIMARY KEY (id),
  CONSTRAINT newgoal_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) TABLESPACE pg_default;
```

5. Verify the tables were created by clicking **Table Editor** in the sidebar

> **Note**: The `npm run migrate` and `npm run seed` scripts are legacy code from an earlier version and **do not work** with Supabase. All database setup must be done through the Supabase dashboard.

> **Security Note**: Row Level Security (RLS) policies are not currently implemented. This means any authenticated user can access all data. RLS policies should be added before deploying to production.

#### 6. (Optional) Disable Email Confirmation

By default, Supabase requires users to confirm their email before logging in. For local development, you may want to disable this:

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Scroll to **Email** provider settings
3. Toggle **OFF** the option "Confirm email"
4. Click **Save**

Now users can register and log in immediately without email verification.

#### 7. Start the Development Server
```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3000
```

#### 8. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Verification Checklist

1. ✅ Home page loads without errors
2. ✅ Click **Register** to create a new account
3. ✅ Enter email, display name, and password (8+ characters)
4. ✅ Check your email for confirmation link (if email confirmation is enabled)
5. ✅ Log in with your credentials
6. ✅ Navigate to **Dashboard**
7. ✅ Click **New Goal** to create a goal
8. ✅ View your goals listed on the dashboard
9. ✅ Edit/delete goals to verify CRUD operations

### Available npm Commands

```bash
npm start              # Start production server
npm run dev            # Start development server with auto-reload
npm run lint           # Check code for linting errors
npm run lint:fix       # Fix linting errors automatically
npm run format         # Format code with Prettier
```

> **Note**: The `npm run migrate`, `npm run seed`, and `npm run reset` commands visible in `package.json` are **legacy code** and do not work with the current Supabase setup.

### Troubleshooting

**"Missing SUPABASE_URL or SUPABASE_ANON_KEY"**
- Check that `.env` file exists in the project root
- Verify you copied the correct values from Supabase dashboard
- Make sure you restarted the dev server after updating `.env`

**"Database table 'users' does not exist"**
- Run the SQL commands from Step 5 in the setup instructions
- Verify tables are created in Supabase dashboard → **Table Editor**
- Check that you're using the correct Supabase project

**"Authentication failed"**
- Supabase may require email confirmation for new signups
- Check your email inbox for a confirmation link
- Or disable email confirmation: Supabase → **Auth** → **Providers** → **Email** → Toggle off "Confirm email"
- Verify your email and password are correct

**Port 3000 already in use**
- Change PORT in `.env` to a different port (e.g., 3001)
- Or kill the process using port 3000

---

## 4. Error Handling Section

### Error Types & Handling

The application handles several types of errors gracefully:

#### Supabase/Database Errors
- **Connection Failures**: Network errors or invalid credentials caught and logged
- **Query Errors**: Table/column not found or constraint violations
- **Auth Errors**: Invalid credentials, email already exists

```javascript
// Model layer catches Supabase errors
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', id);

if (error) throw error;  // Throws Supabase error
```

```javascript
// Controller handles the error
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('profile', { user });
  } catch (error) {
    next(error);  // Passes to error middleware
  }
};
```

#### Validation Errors
- **Input Validation**: Empty fields, invalid email format, weak passwords
- **CSRF Token Validation**: Missing or invalid tokens on POST requests

```javascript
// Validation middleware using express-validator
exports.postRegister = [
  body('email').trim().isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
  body('display_name').trim().notEmpty().withMessage('Name required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('users/register', { 
        errors: errors.array() 
      });
    }
    // Continue processing if valid
  }
];
```

#### Authentication Errors
- **Unauthorized Access**: Accessing protected routes without login
- **Session Expiration**: Session cookie expires after inactivity
- **Invalid Credentials**: Wrong email/password combination

```javascript
// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/users/login');
  }
  next();
}

// Applied to protected routes
router.get('/dashboard', requireAuth, dashboardController.show);
```

#### Application Errors
- **Resource Not Found**: Goal/user doesn't exist (404)
- **Server Errors**: Unhandled exceptions (500)

```javascript
// Handle missing resources
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).render('error', { 
        message: 'Goal not found' 
      });
    }
    res.render('goals/show', { goal });
  } catch (error) {
    next(error);
  }
};
```

### Error Handling Flow

1. **Error Occurs** - In controller, model, middleware, or Supabase call
2. **Try/Catch Block** - Developer catches the error
3. **Error Middleware** - `next(error)` passes it to Express error handler
4. **Logging** - Error details logged to console (development mode)
5. **User Response** - Generic error page rendered to users (production)

```javascript
// Central error middleware in src/app.js
app.use((err, req, res, next) => {
  // Log the full error for debugging
  console.error('Error:', err.stack);
  
  // Render appropriate error page
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong. Please try again.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
```

### Development vs. Production Error Handling

| Aspect | Development | Production |
|--------|-------------|-----------|
| Full Stack Trace | ✅ Shown to user | ❌ Logged only |
| Console Logging | ✅ Detailed output | ⚠️ Minimal logging |
| Error Messages | ✅ Technical details | ✅ User-friendly only |
| Debug Info | ✅ Full error object | ❌ Empty object |
| HTTPS/Secure Cookies | ❌ Not required | ✅ Required |

### Common Error Scenarios & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing SUPABASE_URL or SUPABASE_ANON_KEY" | Missing environment variables | Copy `.env.example` to `.env` and add your Supabase credentials |
| "Table 'users' or 'newgoal' does not exist" | Tables not created in Supabase | Run the SQL commands from Step 5 in Supabase SQL Editor |
| "Cannot POST /users/login" | CSRF token missing in form | Ensure forms include `<input type="hidden" name="_csrf" value="<%= csrfToken %>">` |
| "Unauthorized" or redirect to login | User not authenticated | Session expired or user not logged in |
| "Email already exists" | User tries to register with existing email | This is expected - email must be unique |
| "Email not confirmed" | Email confirmation required | Check email for confirmation link or disable email confirmation in Supabase Auth settings |
| "Invalid CSRF token" | Session expired or form token mismatch | Refresh the page and try again |
| Port 3000 already in use | Another process using the port | Change PORT in `.env` to 3001 or kill the other process |

### Best Practices for Error Handling

1. **Always use try/catch** in async controller functions
2. **Pass errors to middleware** using `next(error)` for centralized handling
3. **Never expose sensitive info** (database URLs, password hashes) in error messages
4. **Log errors properly** with context (user ID, request path, timestamp)
5. **Validate input early** to prevent errors before they occur
6. **Use appropriate HTTP status codes**:
   - `400` - Bad request (validation error)
   - `401` - Unauthorized (not logged in)
   - `403` - Forbidden (no permission)
   - `404` - Not found (resource doesn't exist)
   - `500` - Server error (unexpected failure)

---

## Project Structure

```
├── src/
│   ├── server.js              # Server entry point
│   ├── app.js                 # Express app configuration
│   ├── routes/                # Route definitions
│   │   ├── index.js           # Home/dashboard routes
│   │   ├── users.js           # Auth routes (login, register, logout)
│   │   └── goals.js           # Goal CRUD routes
│   ├── controllers/           # Request handlers
│   │   ├── indexController.js # Home page logic
│   │   ├── userController.js  # Authentication logic
│   │   ├── goalController.js  # Goal CRUD logic
│   │   └── apiController.js   # External API interactions
│   ├── models/                # Database models (Supabase interactions)
│   │   ├── supabaseClient.js  # Supabase SDK initialization
│   │   ├── User.js            # User model
│   │   ├── goals.js           # Goal model
│   │   └── db.js              # Legacy PostgreSQL connection (not used)
│   ├── middleware/            # Custom middleware
│   │   └── auth.js            # Authentication/authorization helpers
│   ├── views/                 # EJS templates
│   │   ├── layout.ejs         # Base layout template
│   │   ├── index.ejs          # Home page
│   │   ├── dashboard.ejs      # User dashboard
│   │   ├── profile.ejs        # User profile page
│   │   ├── about.ejs          # About page
│   │   ├── goals/             # Goal-related pages
│   │   │   ├── index.ejs      # List all goals
│   │   │   ├── show.ejs       # View single goal
│   │   │   ├── new.ejs        # Create goal form
│   │   │   └── edit.ejs       # Edit goal form
│   │   └── users/             # Auth pages
│   │       ├── login.ejs      # Login form
│   │       └── register.ejs   # Registration form
│   └── public/                # Static files
│       ├── css/
│       │   └── style.css      # Main stylesheet
│       └── js/
│           └── main.js        # Client-side JavaScript
├── db/                        # ⚠️ Legacy database scripts (not used with Supabase)
│   ├── migrations/            # SQL migration files (unused)
│   ├── seeds/                 # Sample data files (unused)
│   ├── migrate.js             # Migration runner (broken)
│   ├── seed.js                # Seed runner (broken)
│   └── reset.js               # Database reset script (broken)
├── docs/                      # Documentation
│   ├── README.md              # Documentation overview
│   ├── SETUP.md               # Setup guide
│   └── ARCHITECTURE.md        # Architecture details
├── .env.example               # ⚠️ Outdated environment template
├── .env                       # Your local environment variables (not in git)
├── .eslintrc.json             # ESLint configuration
├── .prettierrc.json           # Prettier configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

**Note**: Files/folders marked with ⚠️ are legacy code from an earlier version using direct PostgreSQL connections and do not work with the current Supabase implementation.

---

## Database Schema

### users Table
Stores user profile information. The `id` field matches Supabase Auth user IDs.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, from Supabase Auth |
| email | VARCHAR(255) | User's email, unique |
| display_name | VARCHAR(255) | User's display name |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### newgoal Table
Stores user goals and their details.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| user_id | UUID | Foreign key to users table, nullable |
| goalname | TEXT | Goal title |
| description | TEXT | Goal description |
| due | DATE | Target completion date |

---

## Environment Variables Reference

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Server Configuration
NODE_ENV=development|production
PORT=3000

# Session Configuration (Required)
SESSION_SECRET=a-long-random-string-change-in-production

# Optional
TRUST_PROXY=1  # Set to 1 if behind a reverse proxy (e.g., Render, Heroku)
```

---

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Templating**: EJS with express-ejs-layouts
- **Database**: PostgreSQL (hosted on Supabase)
- **Auth**: Supabase Auth
- **SDK**: @supabase/supabase-js v2.80.0
- **Security**: Helmet, express-session, csurf
- **Validation**: express-validator
- **Development**: ESLint, Prettier, Nodemon

---

## Getting Help

- **Setup Issues** - Check `docs/SETUP.md` for troubleshooting (note: may contain outdated info)
- **Architecture Questions** - Read `docs/ARCHITECTURE.md` for detailed patterns (note: references old PostgreSQL setup)
- **Code Comments** - Inline comments throughout the source code explain implementation
- **Supabase Docs** - [https://supabase.com/docs](https://supabase.com/docs)
- **Express Docs** - [https://expressjs.com](https://expressjs.com)

---

## Deployment Considerations

When deploying to production:

1. **Environment Variables**
   - Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your production Supabase project
   - Generate a strong random `SESSION_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - Set `NODE_ENV=production`
   - Enable `TRUST_PROXY=1` if behind a reverse proxy

2. **Security Settings**
   - Session cookies will automatically use `secure: true` in production (requires HTTPS)
   - Helmet security headers are pre-configured
   - CSRF protection is enabled for all state-changing requests

3. **Database (Supabase)**
   - Ensure Row Level Security (RLS) policies are properly configured
   - Review and adjust RLS policies for production security requirements
   - Supabase provides automatic daily backups
   - Consider setting up database webhooks for critical operations

4. **Supabase Auth Settings**
   - Configure email templates in Supabase dashboard
   - Set up proper redirect URLs for production domain
   - Enable email confirmation for production
   - Configure rate limiting for auth endpoints

5. **Platform-Specific Notes**
   - **Render**: Set environment variables in dashboard, enable `TRUST_PROXY=1`
   - **Heroku**: Use Heroku config vars, add `Procfile` if needed
   - **Vercel**: Not recommended (requires serverless adaptation)

---

## Known Issues & Limitations

1. **Legacy Database Scripts**: The `npm run migrate`, `npm run seed`, and `npm run reset` commands in `package.json` do not work with Supabase and will fail if executed. These are remnants from an earlier PostgreSQL-based implementation.

2. **Outdated Documentation**: The files in `docs/` folder (`SETUP.md`, `ARCHITECTURE.md`) contain references to local PostgreSQL setup and may not reflect the current Supabase implementation.

3. **`.env.example` File**: Contains outdated PostgreSQL credentials (`DB_HOST`, `DB_USER`, etc.) that are not used. Refer to the environment variables section in this README instead.

4. **No Row Level Security**: RLS policies are not implemented. Any authenticated user can currently access all data in the database. This is a security risk for production environments.

5. **Incomplete User-Goal Association**: While the `newgoal` table has a `user_id` column, the application logic doesn't consistently filter goals by user. Goals may be visible across users.

---

## Future Improvements

- **Security**: Implement Row Level Security (RLS) policies to restrict data access by user
- **User Scoping**: Update application logic to consistently filter goals by `user_id`
- **Milestones**: Implement milestones functionality (currently stubbed out in UI)
- **Progress Logs**: Implement progress logs functionality (currently stubbed out in UI)
- **Real-time Updates**: Add real-time features using Supabase subscriptions
- **Visualizations**: Integrate charts/visualizations for goal progress tracking
- **Notifications**: Add email notifications for upcoming goal deadlines
- **File Uploads**: Add support for attaching files/images to goals
- **Collaboration**: Implement goal sharing and collaboration features
- **Timestamps**: Add `created_at` and `updated_at` to `newgoal` table for better tracking

---

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Node.js Documentation](https://nodejs.org/docs/)
- [OWASP Security Guide](https://owasp.org/)

---

## Contributing

This is a student project for CS346. If you find issues or have suggestions:
- Document any bugs you encounter
- Test thoroughly before committing changes
- Follow the existing code style (run `npm run lint` and `npm run format`)
- Update this README if you change the architecture

---

## License

ISC

# School-Fee-Management-System
# School Fee Management System - Local Deployment Guide (Windows)

## 📋 Project Overview
A complete school fee management system with student management, fee structure assignment, payment recording, and reporting features.

## 🛠️ System Requirements

### Backend Requirements
- **Node.js**: v18.x or higher
- **MongoDB**: v6.0 or higher
- **npm**: v8.x or higher

### Frontend Requirements
- **Node.js**: v18.x or higher (same as backend)
- **npm**: v8.x or higher

## 📁 Project Structure
```
school-fee-management-system/
├── backend_functionality/     # Backend API
└── frontend/                  # React frontend (your current project folder)
```

## 🔧 Step 1: Install Prerequisites

### 1.1 Install Node.js
1. Download Node.js from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
2. Run the installer (includes npm)
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 1.2 Install MongoDB
1. Download MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. During installation, check "Install MongoDB Compass" (optional but recommended)
4. Start MongoDB service:
   - Press `Win + R`, type `services.msc`
   - Find "MongoDB Server", right-click → Start

## 🔧 Step 2: Setup Backend

### 2.1 Navigate to Backend Directory
```cmd
cd backend_functionality
```

### 2.2 Install Dependencies
```cmd
npm install
```

### 2.3 Create Environment File
Create `.env` file in `backend_functionality` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/school_fee_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

### 2.4 Start Backend Server
```cmd
npm run dev
```
**Expected Output**: `📡 Server running on http://localhost:5000`

## 🔧 Step 3: Setup Frontend

### 3.1 Navigate to Frontend Directory
```cmd
cd frontend
```

### 3.2 Install Dependencies
```cmd
npm install
```

### 3.3 Create Environment File
Create `.env` file in `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3.4 Start Frontend Development Server
```cmd
npm run dev
```
**Expected Output**: `Local: http://localhost:5173/`

## 🔌 Database Configuration

### MongoDB Connection Details
- **Host**: `localhost`
- **Port**: `27017`
- **Database Name**: `school_fee_db`
- **Connection String**: `mongodb://localhost:27017/school_fee_db`

### Create Initial Admin User (Optional)
If you need to create an admin user manually, use MongoDB Compass or run this in MongoDB shell:
```javascript
use school_fee_db
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2b$10$your_hashed_password_here",
  role: "admin",
  contact: "+1234567890"
})
```

## 🚀 Running the Application

### Start Both Servers
1. **Terminal 1** (Backend):
   ```cmd
   cd backend_functionality
   npm run dev
   ```

2. **Terminal 2** (Frontend):
   ```cmd
   cd frontend
   npm run dev
   ```

### Access the Application
Open your browser and go to: **http://localhost:5173**

## 🔐 Default Login Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123` (if you created the sample user above)

> **Note**: If no users exist, register as admin first through your registration flow.

## 📂 Important Files and Directories

### Backend Key Files
- `server.js` - Main server file
- `models/` - Database models
- `controllers/` - Business logic
- `routes/` - API routes
- `.env` - Environment variables

### Frontend Key Files
- `src/App.jsx` - Main routing
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/context/AuthContext.js` - Authentication context
- `.env` - Environment variables

## 🛠️ Troubleshooting Common Issues

### Issue 1: MongoDB Connection Error
**Error**: `MongoDB connection error`
**Solution**:
1. Ensure MongoDB service is running (`services.msc`)
2. Verify connection string in `.env` file
3. Check if MongoDB is installed on port 27017

### Issue 2: CORS Error
**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`
**Solution**:
Ensure backend has correct CORS configuration:
```js
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```

### Issue 3: Module Not Found Errors
**Error**: `Cannot find module '...'`
**Solution**:
Run `npm install` in both backend and frontend directories

### Issue 4: Port Already in Use
**Error**: `EADDRINUSE: address already in use`
**Solution**:
Kill existing processes:
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

## 📱 Feature List

### Student Management
- ✅ Add students with parent details
- ✅ Edit/delete students
- ✅ Search and filter students
- ✅ Pagination support

### Fee Management
- ✅ Create fee categories (Tuition, Transport, etc.)
- ✅ Create class-specific fee structures
- ✅ Assign fee structures to students
- ✅ Auto-assign fee structures for new students

### Payment System
- ✅ Record partial/full payments
- ✅ Multiple payment methods (Cash, Bank Transfer, etc.)
- ✅ Payment history tracking
- ✅ Balance calculation

### Reporting
- ✅ Students with submitted fees
- ✅ Students with pending fees
- ✅ Overdue payment alerts
- ✅ Financial summaries

### User Roles
- **Admin**: Full access to all features
- **Accountant**: Payment recording and reporting
- **Parent**: View own children's fees and payments

## 🔄 Updating the Application

### Backend Updates
1. Stop backend server (`Ctrl + C`)
2. Make changes to backend files
3. Restart with `npm run dev`

### Frontend Updates
1. Changes auto-reload in development
2. For production build: `npm run build`

## 📦 Production Build (Optional)

### Build Frontend for Production
```cmd
cd frontend
npm run build
```

### Serve Production Build with Backend
Update `server.js` to serve static files:
```js
// Add before 404 handler
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

## 📞 Support
For issues not covered in this guide, check:
- Backend console logs
- Browser developer tools (F12)
- MongoDB Compass for database inspection

---

**✅ Your School Fee Management System is now ready for local development on Windows!**

Access at: **http://localhost:5173**
Backend API: **http://localhost:5000**

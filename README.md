# 🙏 Narayan Naam Jap - Spiritual Rewards App

A beautiful web application where users earn coins by chanting "Narayan". Features include real-time speech recognition, coin rewards system (100 coins = ₹1), user authentication, and profile management.

## 🌟 Features

✅ **Complete Authentication System**
- User signup and login
- JWT-based authentication
- Secure password hashing with bcrypt

✅ **Speech Recognition**
- Real-time microphone access
- Detects "Narayan" chanting
- Multi-language support (Hindi/English)

✅ **Coin Rewards System**
- Earn 1 coin per "Narayan" chant
- 100 coins = ₹1 Indian Rupee
- Track total earnings

✅ **User Dashboard**
- Home page with chanting interface
- Wallet page with balance and transactions
- Profile page with statistics and achievements

✅ **Real-Time Features**
- WebSocket integration for live updates
- Instant coin notifications
- Achievement unlocks

✅ **Beautiful UI/UX**
- Modern gradient design
- Smooth animations
- Responsive mobile-first layout
- Bottom navigation

## 📁 Files Included

1. **narayan-jap-app.html** - Complete frontend (HTML + CSS + JavaScript)
2. **backend-server.js** - Full Node.js backend with Express & MongoDB
3. **package.json** - Backend dependencies
4. **.env.example** - Environment configuration template
5. **DEPLOYMENT_GUIDE.md** - Detailed setup and deployment instructions
6. **README.md** - This file

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Backend

```bash
# Install Node.js from https://nodejs.org/ if you haven't

# Install MongoDB from https://www.mongodb.com/try/download/community

# Create project folder
mkdir narayan-jap && cd narayan-jap

# Copy all backend files to this folder, then:
npm install

# Create .env file
cp .env.example .env

# Edit .env and set:
# MONGODB_URI=mongodb://localhost:27017/narayan-jap
# JWT_SECRET=your-random-secret-key

# Start MongoDB
# Windows: It starts automatically
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# Start backend server
npm start
```

Server should start at http://localhost:3000

### Step 2: Setup Frontend

```bash
# Open narayan-jap-app.html in any code editor

# Update API_URL (around line 500)
const API_URL = 'http://localhost:3000/api';

# Save the file
```

### Step 3: Run the App

```bash
# Option 1: Just open the HTML file in Chrome/Edge
# Right-click narayan-jap-app.html → Open with → Chrome

# Option 2: Use a local server (better)
# Python:
python -m http.server 8080

# Node.js:
npx http-server -p 8080

# Then open: http://localhost:8080
```

## 📱 How to Use

1. **Sign Up** - Create an account with name, email, password
2. **Grant Microphone Permission** - Allow access when prompted
3. **Start Chanting** - Tap the circular button and say "Narayan"
4. **Earn Coins** - Get 1 coin per detected chant
5. **Check Wallet** - View your balance (100 coins = ₹1)
6. **View Profile** - See your statistics and achievements

## 🔐 Default Test Account (After Signup)

You'll need to create your own account. No default credentials.

## 🌐 For Production Deployment

See **DEPLOYMENT_GUIDE.md** for detailed instructions on:
- MongoDB Atlas (cloud database)
- Heroku/Railway/Render deployment
- HTTPS setup
- Domain configuration
- Security hardening

## 🛠️ Technology Stack

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript
- Web Speech API (Speech Recognition)
- Socket.IO Client

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO (WebSockets)
- bcryptjs (Password Hashing)

## 📊 API Endpoints

```
POST   /api/auth/signup          - Create new user
POST   /api/auth/login           - Login user
GET    /api/user/profile         - Get user profile
PUT    /api/user/profile         - Update profile
POST   /api/jap/record           - Record a chant
GET    /api/jap/history          - Get chant history
GET    /api/jap/stats            - Get statistics
GET    /api/transactions         - Get transactions
GET    /api/achievements         - Get achievements
GET    /api/leaderboard          - Get leaderboard
GET    /api/health               - Health check
```

## 🎯 Things to Add for Real Production

1. **Payment Gateway Integration**
   - Razorpay or Stripe for withdrawals
   - UPI payment for India
   - Minimum withdrawal limits

2. **Email System**
   - Email verification
   - Password reset
   - Transaction notifications

3. **Enhanced Features**
   - Daily login rewards
   - Streak bonuses
   - Referral system
   - Social sharing
   - Leaderboard UI

4. **Security**
   - Rate limiting (already in guide)
   - Input sanitization
   - CAPTCHA for signup
   - Account verification

5. **Mobile Apps**
   - React Native version
   - Flutter version
   - PWA optimization

6. **Admin Panel**
   - User management
   - Transaction monitoring
   - Analytics dashboard
   - Content management

7. **Cloud Infrastructure**
   - CDN for assets
   - Redis for caching
   - Load balancing
   - Auto-scaling

8. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Server logs

## ⚠️ Important Notes

1. **Browser Support**: Works best in Chrome and Edge (they have the best Speech Recognition API support)

2. **Microphone Permission**: Users must grant microphone access for the app to work

3. **Internet Required**: Speech recognition requires internet connection

4. **Database**: Must have MongoDB running for backend to work

5. **CORS**: Make sure frontend and backend URLs are properly configured in CORS settings

6. **Security**: Change JWT_SECRET in production to a random string (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

## 🐛 Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify .env file exists and is configured
- Check if port 3000 is already in use

**Frontend can't connect:**
- Verify backend is running
- Check API_URL in frontend code
- Check browser console for CORS errors
- Make sure CORS is enabled in backend

**Speech recognition not working:**
- Use Chrome or Edge browser
- Grant microphone permission
- Check if HTTPS is enabled (required for production)
- Test microphone in browser settings

**No coins being added:**
- Check if backend API is reachable
- Verify authentication token is valid
- Check browser console and network tab

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

This is a demonstration project. For real production use:
1. Add proper error handling
2. Implement comprehensive testing
3. Add logging and monitoring
4. Follow security best practices
5. Add proper documentation

## 📞 Support-----koshik3233@gmail.com 

For issues or questions:
1. Check DEPLOYMENT_GUIDE.md
2. Review browser console errors
3. Check backend logs
4. Verify MongoDB connection

---

**Made with 🙏 for spiritual practice and rewards**

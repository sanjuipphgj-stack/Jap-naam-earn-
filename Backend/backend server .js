// Narayan Naam Jap - Backend Server
// Complete backend with MongoDB, JWT, and real-time features

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/narayan-jap';

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    coins: {
        type: Number,
        default: 0
    },
    totalJaps: {
        type: Number,
        default: 0
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    profile: {
        avatar: String,
        bio: String,
        level: {
            type: Number,
            default: 1
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Jap (Chant) Schema
const japSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinsEarned: {
        type: Number,
        default: 1
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    audioConfidence: {
        type: Number,
        min: 0,
        max: 1
    }
}, {
    timestamps: true
});

const Jap = mongoose.model('Jap', japSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['jap_reward', 'achievement', 'daily_bonus', 'withdrawal'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Achievement Schema
const achievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    icon: String,
    unlockedAt: {
        type: Date,
        default: Date.now
    }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

// Middleware: Verify JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                totalJaps: user.totalJaps
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last active
        user.lastActive = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                totalJaps: user.totalJaps
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ==================== USER ROUTES ====================

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const japCount = await Jap.countDocuments({ userId: user._id });
        const recentJaps = await Jap.find({ userId: user._id })
            .sort({ timestamp: -1 })
            .limit(10);

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                totalJaps: user.totalJaps,
                joinDate: user.joinDate,
                lastActive: user.lastActive
            },
            stats: {
                japCount,
                rupees: (user.coins / 100).toFixed(2),
                daysActive: Math.floor((Date.now() - user.joinDate) / (1000 * 60 * 60 * 24))
            },
            recentJaps
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (bio) user.profile.bio = bio;
        if (avatar) user.profile.avatar = avatar;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// ==================== JAP ROUTES ====================

// Record a Jap (Chant)
app.post('/api/jap/record', authenticateToken, async (req, res) => {
    try {
        const { audioConfidence } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create jap record
        const jap = new Jap({
            userId: user._id,
            coinsEarned: 1,
            audioConfidence: audioConfidence || 0.9
        });

        await jap.save();

        // Update user stats
        user.coins += 1;
        user.totalJaps += 1;
        user.lastActive = new Date();
        await user.save();

        // Create transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'jap_reward',
            amount: 1,
            description: 'Narayan Chant Reward'
        });

        await transaction.save();

        // Check for achievements
        await checkAndUnlockAchievements(user);

        // Emit real-time update
        io.to(user._id.toString()).emit('japRecorded', {
            coins: user.coins,
            totalJaps: user.totalJaps,
            timestamp: jap.timestamp
        });

        res.json({
            message: 'Jap recorded successfully',
            coins: user.coins,
            totalJaps: user.totalJaps,
            rupees: (user.coins / 100).toFixed(2)
        });

    } catch (error) {
        console.error('Jap record error:', error);
        res.status(500).json({ error: 'Error recording jap' });
    }
});

// Get Jap History
app.get('/api/jap/history', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const japs = await Jap.find({ userId: req.user.userId })
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Jap.countDocuments({ userId: req.user.userId });

        res.json({
            japs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalJaps: total
        });

    } catch (error) {
        console.error('Jap history error:', error);
        res.status(500).json({ error: 'Error fetching jap history' });
    }
});

// Get Jap Statistics
app.get('/api/jap/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Today's japs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayJaps = await Jap.countDocuments({
            userId,
            timestamp: { $gte: today }
        });

        // This week's japs
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const weekJaps = await Jap.countDocuments({
            userId,
            timestamp: { $gte: weekStart }
        });

        // This month's japs
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthJaps = await Jap.countDocuments({
            userId,
            timestamp: { $gte: monthStart }
        });

        // Get daily stats for last 7 days
        const dailyStats = await Jap.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: weekStart }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    count: { $sum: 1 },
                    coins: { $sum: '$coinsEarned' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            todayJaps,
            weekJaps,
            monthJaps,
            dailyStats
        });

    } catch (error) {
        console.error('Jap stats error:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// ==================== TRANSACTION ROUTES ====================

// Get Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        
        const query = { userId: req.user.userId };
        if (type) query.type = type;

        const transactions = await Transaction.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total
        });

    } catch (error) {
        console.error('Transactions fetch error:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

// ==================== ACHIEVEMENT ROUTES ====================

// Get User Achievements
app.get('/api/achievements', authenticateToken, async (req, res) => {
    try {
        const achievements = await Achievement.find({ userId: req.user.userId })
            .sort({ unlockedAt: -1 });

        res.json({
            achievements,
            totalAchievements: achievements.length
        });

    } catch (error) {
        console.error('Achievements fetch error:', error);
        res.status(500).json({ error: 'Error fetching achievements' });
    }
});

// Achievement Check Function
async function checkAndUnlockAchievements(user) {
    const achievements = [];

    // First Jap
    if (user.totalJaps === 1) {
        achievements.push({
            userId: user._id,
            title: 'First Chant',
            description: 'Complete your first Narayan chant',
            icon: '🌟'
        });
    }

    // 100 Japs
    if (user.totalJaps === 100) {
        achievements.push({
            userId: user._id,
            title: '100 Chants',
            description: 'Reach 100 total chants',
            icon: '🔥'
        });
    }

    // 1000 Coins
    if (user.coins === 1000) {
        achievements.push({
            userId: user._id,
            title: 'Coin Master',
            description: 'Earn 1000 coins',
            icon: '💎'
        });
    }

    // 7 Day Streak
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dailyCounts = await Jap.aggregate([
        {
            $match: {
                userId: user._id,
                timestamp: { $gte: weekAgo }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                }
            }
        }
    ]);

    if (dailyCounts.length === 7) {
        achievements.push({
            userId: user._id,
            title: '7 Day Streak',
            description: 'Chant for 7 consecutive days',
            icon: '🔥'
        });
    }

    // Save achievements
    if (achievements.length > 0) {
        await Achievement.insertMany(achievements);
        
        // Emit achievement notification
        io.to(user._id.toString()).emit('achievementUnlocked', achievements);
    }
}

// ==================== LEADERBOARD ROUTES ====================

// Get Leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const { period = 'all', limit = 50 } = req.query;
        
        let query = {};
        
        if (period === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.lastActive = { $gte: today };
        } else if (period === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query.lastActive = { $gte: weekAgo };
        }

        const leaderboard = await User.find(query)
            .select('name coins totalJaps profile.avatar')
            .sort({ coins: -1 })
            .limit(limit);

        // Get current user rank
        const userRank = await User.countDocuments({
            ...query,
            coins: { $gt: (await User.findById(req.user.userId)).coins }
        }) + 1;

        res.json({
            leaderboard,
            userRank,
            period
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Error fetching leaderboard' });
    }
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('authenticate', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} authenticated`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ==================== START SERVER ====================

server.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   Narayan Naam Jap Backend Server        ║
    ║   🙏 Server running on port ${PORT}         ║
    ║   📡 MongoDB: ${MONGODB_URI.includes('localhost') ? 'Local' : 'Cloud'}          ║
    ╚═══════════════════════════════════════════╝
    `);
});

module.exports = app;

import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import VerifiedGovernor from '../models/VerifiedGovernor.js';
import User from '../models/User.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

/**
 * POST /api/admin/upload-whitelist
 * Upload Excel file with verified governor IDs
 */
router.post('/upload-whitelist', authMiddleware, adminMiddleware, upload.single('whitelist'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    // Look for '3584' sheet or use first sheet
    let sheetName = '3584';
    if (!workbook.SheetNames.includes(sheetName)) {
      sheetName = workbook.SheetNames[0];
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length < 2) {
      return res.status(400).json({ error: 'Excel file appears to be empty or has no data rows' });
    }

    // Find column indices
    const headers = data[0].map(h => String(h || '').toLowerCase());
    const governorIdIndex = headers.findIndex(h =>
      h.includes('governor id') || h === 'id' || h === 'governorid'
    );
    const governorNameIndex = headers.findIndex(h =>
      h.includes('governor name') || h === 'name' || h === 'governorname'
    );
    const powerIndex = headers.findIndex(h => h === 'power');
    const allianceIndex = headers.findIndex(h =>
      h.includes('alliance') || h === 'alliance tag'
    );
    const killPointsIndex = headers.findIndex(h =>
      h.includes('kill points') || h === 'kp' || h === 'killpoints'
    );
    const deadsIndex = headers.findIndex(h => h === 'deads');

    if (governorIdIndex === -1) {
      return res.status(400).json({
        error: 'Could not find Governor ID column. Expected column names: "Governor ID", "ID", or "GovernorID"'
      });
    }

    // Process rows
    const governors = [];
    const errors = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[governorIdIndex]) continue;

      const governorId = String(row[governorIdIndex]).trim();
      if (!governorId) continue;

      governors.push({
        visibleGovernorId: governorId,
        governorName: governorNameIndex !== -1 ? String(row[governorNameIndex] || 'Unknown') : 'Unknown',
        power: powerIndex !== -1 ? Number(row[powerIndex]) || 0 : 0,
        allianceTag: allianceIndex !== -1 ? String(row[allianceIndex] || '') : null,
        killPoints: killPointsIndex !== -1 ? Number(row[killPointsIndex]) || 0 : 0,
        deads: deadsIndex !== -1 ? Number(row[deadsIndex]) || 0 : 0,
        lastUpdated: new Date()
      });
    }

    if (governors.length === 0) {
      return res.status(400).json({ error: 'No valid governor data found in the file' });
    }

    // Clear existing whitelist and insert new data
    await VerifiedGovernor.deleteMany({});
    await VerifiedGovernor.insertMany(governors);

    res.json({
      success: true,
      message: `Successfully uploaded ${governors.length} verified governors`,
      count: governors.length,
      sheetUsed: sheetName
    });
  } catch (error) {
    console.error('Upload whitelist error:', error);
    res.status(500).json({ error: error.message || 'Failed to process whitelist file' });
  }
});

/**
 * GET /api/admin/whitelist
 * Get all verified governors
 */
router.get('/whitelist', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { visibleGovernorId: { $regex: search, $options: 'i' } },
          { governorName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await VerifiedGovernor.countDocuments(query);
    const governors = await VerifiedGovernor.find(query)
      .sort({ power: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      governors,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get whitelist error:', error);
    res.status(500).json({ error: 'Failed to get whitelist' });
  }
});

/**
 * GET /api/admin/whitelist/stats
 * Get whitelist statistics
 */
router.get('/whitelist/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalVerified = await VerifiedGovernor.countDocuments();
    const totalUsers = await User.countDocuments();

    // Count how many verified governors have registered
    const verifiedIds = await VerifiedGovernor.find().select('visibleGovernorId');
    const verifiedIdList = verifiedIds.map(v => v.visibleGovernorId);
    const registeredVerified = await User.countDocuments({
      visibleGovernorId: { $in: verifiedIdList }
    });

    const lastUpload = await VerifiedGovernor.findOne().sort({ updatedAt: -1 });

    res.json({
      success: true,
      stats: {
        totalVerified,
        totalUsers,
        registeredVerified,
        unregisteredVerified: totalVerified - registeredVerified,
        lastUploadDate: lastUpload?.updatedAt || null
      }
    });
  } catch (error) {
    console.error('Get whitelist stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * DELETE /api/admin/whitelist/:id
 * Remove a single governor from whitelist
 */
router.delete('/whitelist/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await VerifiedGovernor.findByIdAndDelete(id);
    res.json({ success: true, message: 'Governor removed from whitelist' });
  } catch (error) {
    console.error('Delete from whitelist error:', error);
    res.status(500).json({ error: 'Failed to remove governor' });
  }
});

/**
 * POST /api/admin/whitelist/add
 * Manually add a single governor to whitelist
 */
router.post('/whitelist/add', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { visibleGovernorId, governorName } = req.body;

    if (!visibleGovernorId) {
      return res.status(400).json({ error: 'Governor ID is required' });
    }

    // Check if already exists
    const existing = await VerifiedGovernor.findOne({ visibleGovernorId: String(visibleGovernorId) });
    if (existing) {
      return res.status(400).json({ error: 'Governor ID already in whitelist' });
    }

    const governor = await VerifiedGovernor.create({
      visibleGovernorId: String(visibleGovernorId),
      governorName: governorName || 'Manually Added',
      lastUpdated: new Date()
    });

    res.json({ success: true, governor });
  } catch (error) {
    console.error('Add to whitelist error:', error);
    res.status(500).json({ error: 'Failed to add governor' });
  }
});

/**
 * GET /api/admin/users
 * Get all registered users with their verification status
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('governorId');

    // Check verification status for each user
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      const isVerified = await VerifiedGovernor.isVerified(user.visibleGovernorId);
      return {
        ...user.toObject(),
        isVerified
      };
    }));

    res.json({ success: true, users: usersWithStatus });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;

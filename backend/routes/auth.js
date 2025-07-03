const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/login', authController.login);
router.post('/register', auth, role('Admin'), authController.register); // Admin only

module.exports = router;

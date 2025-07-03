const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('Admin'), userController.getUsers);
router.delete('/:id', auth, role('Admin'), userController.deleteUser);
router.get('/me', auth, userController.getMe);
router.post('/register', userController.registerUser);
router.put('/me', auth, userController.updateMe);
router.put('/me/password', auth, userController.changePassword);

module.exports = router;

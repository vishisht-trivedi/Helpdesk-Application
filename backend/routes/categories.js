const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, categoryController.getCategories);
router.post('/', auth, role('Admin'), categoryController.addCategory);
router.delete('/:id', auth, role('Admin'), categoryController.deleteCategory);

module.exports = router;

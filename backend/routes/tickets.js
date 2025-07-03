const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/create', auth, upload.single('attachment'), ticketController.createTicket);
router.get('/list', auth, ticketController.getTickets);
router.put('/update/:id', auth, ticketController.updateTicket);
router.get('/stats', auth, ticketController.getStats);
router.get('/:id', auth, ticketController.getTicketById);

module.exports = router;

const express = require('express');
const { register, login, logout, verifyEmail, forgotPassword, resetPassword } = require('@controller/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/email/verify/:code', verifyEmail);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset', resetPassword);

module.exports = router;

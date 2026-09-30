const express = require("express");
const {
    register,
    login,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, async (req, res) => {
    res.json({
        message: "You are authenticated",
        userId: req.user.userId,
    });
});

module.exports = router;
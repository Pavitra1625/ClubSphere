const router = require("express").Router();
const controller = require("../controllers/authController");
const { requireAuth, allowRoles } = require("../middleware/auth");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.me);
router.get("/students", requireAuth, allowRoles("admin"), controller.listStudents);

module.exports = router;

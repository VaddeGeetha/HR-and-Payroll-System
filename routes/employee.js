const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const { getEmployees ,
        addEmployee,
        updateEmployee,
        deleteEmployee
} = require("../controllers/employeeController");

router.get("/", authorize("admin", "hr", "employee"), getEmployees);

router.post("/", authorize("admin", "hr"), addEmployee);

router.put("/:id", authorize("admin", "hr", "employee"), updateEmployee);

router.delete("/:id", authorize("admin", "hr"), deleteEmployee);

module.exports = router;
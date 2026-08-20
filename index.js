const employeeRoutes = require("./routes/employee");
const authRoutes = require("./routes/auth");
const leaveRoutes = require("./routes/leave");
const payrollRoutes = require("./routes/payroll");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees",employeeRoutes);
console.log("LEAVE ROUTES LOADED");
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "HR Payroll Backend is Running "
    });
});

// Test Supabase connection
app.get("/test-db", async (req, res) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*");

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

process.stdin.resume();
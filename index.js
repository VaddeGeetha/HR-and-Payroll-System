const employeeRoutes = require("./routes/employee");
const authRoutes = require("./routes/auth");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { supabase, supabaseAdmin } = require("./supabase");

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/employees",employeeRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "HR Payroll Backend is Running "
    });
});

// Test Supabase connection
app.get("/test-db", async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("employees")
        .select("*");

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
const authRoutes = require("./routes/auth");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
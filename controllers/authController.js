const supabase = require("../supabase");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Login using Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        // Get user profile (role)
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            return res.status(500).json({
                success: false,
                message: profileError.message
            });
        }

        return res.json({
            success: true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile.full_name,
                role: profile.role
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ---------------- FORGOT PASSWORD ----------------
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.json({
            success: true,
            message: "Password reset email sent successfully."
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


module.exports = {
    login,
    forgotPassword
};

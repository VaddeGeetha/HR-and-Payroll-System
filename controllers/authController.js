const transporter=require("../utils/mailer")
const { supabase, supabaseAdmin } = require("../supabase");

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
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .maybeSingle();

        let userFullName = profile?.full_name;
        let userRole = profile?.role;

        if (!userRole) {
            const { data: empRecord } = await supabaseAdmin
                .from("employees")
                .select("name, role")
                .ilike("email", email)
                .maybeSingle();
            
            userFullName = userFullName || empRecord?.name || email.split('@')[0];
            userRole = empRecord?.role || (email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('hr') ? 'hr' : 'employee'));
        }

        return res.json({
            success: true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: userFullName,
                role: userRole
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
        const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

if (profileError || !profile) {
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        const { error } = await supabase
            .from("password_resets")
    .insert([
        {
            user_id: profile.id,
            email,
            otp,
            expiry,
            used: false
        }
    ]);

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find OTP
        const { data, error } = await supabase
            .from("password_resets")
            .select("*")
            .eq("email", email)
            .eq("otp", otp)
            .eq("used", false)
            .single();

        if (error || !data) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check expiry
       const now = new Date().toISOString();

if (data.expiry <= now) {
    return res.status(400).json({
        success: false,
        message: "OTP has expired"
    });
}
        // Update password in Supabase Auth
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            data.user_id,
            {
                password: newPassword
            }
        );

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: updateError.message
            });
        }

        // Mark OTP as used
        await supabase
            .from("password_resets")
            .update({ used: true })
            .eq("id", data.id);

        res.json({
            success: true,
            message: "Password reset successful"
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
    forgotPassword,
    resetPassword
};

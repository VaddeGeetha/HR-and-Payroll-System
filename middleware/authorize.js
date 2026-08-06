const { supabase } = require("../supabase");

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !roles.includes(profile.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

module.exports = authorize;
const { supabaseAdmin } = require("../supabase");

// ============================================
// GET MESSAGES
// GET /api/messages
// ============================================
const getMessages = async (req, res) => {
  try {
    const userEmail = req.user?.email || req.query.email || req.query.from_email;
    const userRole = req.user?.role;

    let query = supabaseAdmin
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    // If regular employee, only show their conversations
    if (userRole === "employee" && userEmail) {
      query = query.or(`from_email.ilike.${userEmail},to_email.ilike.${userEmail}`);
    }

    const { data: messages, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      messages: messages || [],
      data: messages || [],
      message: "Messages fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// SEND MESSAGE
// POST /api/messages
// ============================================
const sendMessage = async (req, res) => {
  try {
    const userEmail = req.user?.email;

    const fromEmail = req.body.from_email || req.body.fromEmail || req.body.from || userEmail || "hr.hr@gmail.com";
    const toEmail = req.body.to_email || req.body.toEmail || req.body.to;
    const text = req.body.text || req.body.message;

    if (!toEmail || !text) {
      return res.status(400).json({
        success: false,
        message: "to_email and text are required"
      });
    }

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          from_email: fromEmail,
          to_email: toEmail,
          text: text.trim(),
          timestamp: Date.now()
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      data: message,
      message: "Message sent successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  getMessages,
  sendMessage
};
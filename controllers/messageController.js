const { supabaseAdmin } = require("../supabase");

// ============================================
// GET MESSAGES
// GET /api/messages
// ============================================
const getMessages = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .or(
        `from_email.eq.${userEmail},to_email.eq.${userEmail}`
      )
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      messages,
      data: messages,
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
    const userEmail = req.user.email;

    const {
      toEmail,
      text
    } = req.body;

    if (!toEmail || !text) {
      return res.status(400).json({
        success: false,
        message: "toEmail and text are required"
      });
    }

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          from_email: userEmail,
          to_email: toEmail,
          text,
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
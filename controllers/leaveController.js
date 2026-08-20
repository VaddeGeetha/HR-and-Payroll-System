const { supabaseAdmin } = require("../supabase");
const transporter = require("../utils/mailer");

const getLeaves = async (req, res) => {
  try {
    const { data: leaves, error } = await supabaseAdmin
      .from("leaves")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: leaves,
      message: "Leaves fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const getPendingLeaves = async (req, res) => {
  try {
    const { data: leaves, error } = await supabaseAdmin
      .from("leaves")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: leaves,
      message: "Pending leaves fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_comment } = req.body;

    // Get the leave and employee details
    const { data: leaveDetails, error: fetchError } = await supabaseAdmin
      .from("leaves")
      .select(`
        *,
        employees (
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !leaveDetails) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    // Update leave status
    const { data: leave, error } = await supabaseAdmin
      .from("leaves")
      .update({
        status: "approved",
        hr_comment: hr_comment || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Send email to employee
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: leaveDetails.employees.email,
      subject: "Leave Request Approved",
      text: `Hello ${leaveDetails.employees.name},

Your leave request has been approved by HR.

Leave Type: ${leaveDetails.leave_type}
Start Date: ${leaveDetails.start_date}
End Date: ${leaveDetails.end_date}
Days: ${leaveDetails.days}
HR Comment: ${hr_comment || "No comment"}

Thank you.`
    });

    res.json({
      success: true,
      data: leave,
      message: "Leave approved successfully"
    });

  } catch (err) {
    console.error("Approve Leave Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_comment } = req.body;

    // Get leave + employee details
    const { data: leaveDetails, error: fetchError } = await supabaseAdmin
      .from("leaves")
      .select(`
        *,
        employees (
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !leaveDetails) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    // Update status
    const { data: leave, error } = await supabaseAdmin
      .from("leaves")
      .update({
        status: "rejected",
        hr_comment: hr_comment || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Send rejection email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: leaveDetails.employees.email,
      subject: "Leave Request Rejected",
      text: `Hello ${leaveDetails.employees.name},

Your leave request has been rejected by HR.

Leave Type: ${leaveDetails.leave_type}
Start Date: ${leaveDetails.start_date}
End Date: ${leaveDetails.end_date}
Days: ${leaveDetails.days}
HR Comment: ${hr_comment || "No comment"}

Please contact HR if you have any questions.`
    });

    res.json({
      success: true,
      data: leave,
      message: "Leave rejected successfully"
    });

  } catch (err) {
    console.error("Reject Leave Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const applyLeave = async (req, res) => {
  try {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      days,
      reason
    } = req.body;

    const { data: leave, error } = await supabaseAdmin
      .from("leaves")
      .insert([
        {
          employee_id,
          leave_type,
          start_date,
          end_date,
          days,
          reason,
          status: "pending"
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
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.HR_EMAIL,
  subject: "New Leave Application",
  text: `A new leave application has been submitted.

Employee ID: ${employee_id}
Leave Type: ${leave_type}
Start Date: ${start_date}
End Date: ${end_date}
Days: ${days}
Reason: ${reason}

Please review the leave request.`
});
    res.status(201).json({
      success: true,
      data: leave,
      message: "Leave applied successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  getPendingLeaves,
   approveLeave,
    rejectLeave
};
const { supabaseAdmin } = require("../supabase");
const transporter = require("../utils/mailer");

// ============================================
// GET ALL LEAVES - HR / ADMIN
// ============================================
const getLeaves = async (req, res) => {
  try {
    const { data: leaves, error } = await supabaseAdmin
      .from("leaves")
      .select(`
        *,
        employees (
          id,
          name,
          email,
          department
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      // If join fails, fetch raw table
      const { data: rawLeaves, error: rawError } = await supabaseAdmin
        .from("leaves")
        .select("*")
        .order("created_at", { ascending: false });

      if (rawError) {
        return res.status(500).json({
          success: false,
          message: rawError.message
        });
      }
      return res.json({
        success: true,
        leaves: rawLeaves || [],
        data: rawLeaves || [],
        message: "Leaves fetched successfully"
      });
    }

    res.json({
      success: true,
      leaves: leaves || [],
      data: leaves || [],
      message: "Leaves fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// GET PENDING LEAVES - HR
// ============================================
const getPendingLeaves = async (req, res) => {
  try {
    const { data: leaves, error } = await supabaseAdmin
      .from("leaves")
      .select(`
        *,
        employees (
          id,
          name,
          email,
          department
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      const { data: rawLeaves, error: rawError } = await supabaseAdmin
        .from("leaves")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (rawError) {
        return res.status(500).json({
          success: false,
          message: rawError.message
        });
      }
      return res.json({
        success: true,
        leaves: rawLeaves || [],
        data: rawLeaves || [],
        message: "Pending leaves fetched successfully"
      });
    }

    res.json({
      success: true,
      leaves: leaves || [],
      data: leaves || [],
      message: "Pending leaves fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// GET MY LEAVES + BALANCE - EMPLOYEE
// ============================================
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || req.query.email;

    // Find employee by user_id OR email
    let employee = null;
    if (userId) {
      const { data: empByUserId } = await supabaseAdmin
        .from("employees")
        .select("id, name, email, department")
        .eq("user_id", userId)
        .maybeSingle();
      employee = empByUserId;
    }

    if (!employee && userEmail) {
      const { data: empByEmail } = await supabaseAdmin
        .from("employees")
        .select("id, name, email, department")
        .ilike("email", userEmail)
        .maybeSingle();
      employee = empByEmail;
    }

    if (!employee) {
      const { data: firstEmp } = await supabaseAdmin
        .from("employees")
        .select("id, name, email, department")
        .limit(1)
        .maybeSingle();
      employee = firstEmp;
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found"
      });
    }

    // Get this employee's leave requests
    const { data: leaves, error: leaveError } = await supabaseAdmin
      .from("leaves")
      .select("*")
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false });

    if (leaveError) {
      return res.status(500).json({
        success: false,
        message: leaveError.message
      });
    }

    // Yearly leave allowance
    const allowance = {
      "Casual Leave": 12,
      "Sick Leave": 10,
      "Earned Leave": 15
    };

    // Only APPROVED leaves reduce the balance
    const approvedLeaves = (leaves || []).filter(
      leave => leave.status === "approved"
    );

    const casualUsed = approvedLeaves
      .filter(leave => leave.leave_type === "Casual Leave")
      .reduce((sum, leave) => sum + Number(leave.days || 0), 0);

    const sickUsed = approvedLeaves
      .filter(leave => leave.leave_type === "Sick Leave")
      .reduce((sum, leave) => sum + Number(leave.days || 0), 0);

    const earnedUsed = approvedLeaves
      .filter(leave => leave.leave_type === "Earned Leave")
      .reduce((sum, leave) => sum + Number(leave.days || 0), 0);

    const balance = {
      casual: Math.max(allowance["Casual Leave"] - casualUsed, 0),
      sick: Math.max(allowance["Sick Leave"] - sickUsed, 0),
      earned: Math.max(allowance["Earned Leave"] - earnedUsed, 0),
      carryForward: 0
    };

    res.json({
      success: true,
      data: {
        employee,
        leaves: leaves || [],
        balance
      },
      leaves: leaves || [],
      message: "Your leaves and balance fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// APPLY LEAVE - EMPLOYEE
// ============================================
const applyLeave = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || req.body.email;
    const employeeId = req.body.employee_id;

    // Find logged-in employee by id, user_id, or email
    let employee = null;
    if (employeeId) {
      const { data: empById } = await supabaseAdmin
        .from("employees")
        .select("id, name, email")
        .eq("id", employeeId)
        .maybeSingle();
      employee = empById;
    }

    if (!employee && userId) {
      const { data: empByUserId } = await supabaseAdmin
        .from("employees")
        .select("id, name, email")
        .eq("user_id", userId)
        .maybeSingle();
      employee = empByUserId;
    }

    if (!employee && userEmail) {
      const { data: empByEmail } = await supabaseAdmin
        .from("employees")
        .select("id, name, email")
        .ilike("email", userEmail)
        .maybeSingle();
      employee = empByEmail;
    }

    if (!employee) {
      const { data: firstEmp } = await supabaseAdmin
        .from("employees")
        .select("id, name, email")
        .limit(1)
        .maybeSingle();
      employee = firstEmp;
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found"
      });
    }

    // Accept frontend field names
    const {
      type,
      from,
      to,
      days,
      reason
    } = req.body;

    if (!type || !from || !to || !reason) {
      return res.status(400).json({
        success: false,
        message: "type, from, to, and reason are required"
      });
    }

    // Validation: Do not allow past dates
    const todayStr = new Date().toISOString().split("T")[0];
    if (from < todayStr) {
      return res.status(400).json({
        success: false,
        message: "Leave cannot be applied for past dates."
      });
    }

    if (to < from) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after start date."
      });
    }

    // ✅ Calculate working days excluding natural weekend holidays (Saturday: 6, Sunday: 0)
    let calculatedWorkingDays = 0;
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d1 <= d2) {
      let cur = new Date(d1);
      while (cur <= d2) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          calculatedWorkingDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    if (calculatedWorkingDays < 1) {
      return res.status(400).json({
        success: false,
        message: "Selected leave period contains 0 business working days (entirely on weekend natural holidays)."
      });
    }

    const finalDays = calculatedWorkingDays;

    // Insert leave request into database
    const { data: leave, error } = await supabaseAdmin
      .from("leaves")
      .insert([
        {
          employee_id: employee.id,
          leave_type: type,
          start_date: from,
          end_date: to,
          days: finalDays,
          reason: reason.trim(),
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

    // Notify HR in background (non-blocking)
    if (process.env.EMAIL_USER && process.env.HR_EMAIL) {
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.HR_EMAIL,
        subject: "New Leave Application",
        text: `A new leave application has been submitted.\n\nEmployee: ${employee.name}\nLeave Type: ${type}\nStart Date: ${from}\nEnd Date: ${to}\nWorking Days: ${finalDays}\nReason: ${reason}`
      }).catch(emailError => console.error("HR email notice failed:", emailError.message));
    }

    res.status(201).json({
      success: true,
      data: leave,
      leave,
      message: "Leave applied successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// APPROVE LEAVE - HR
// ============================================
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body.comment || req.body.hr_comment || "Approved by HR Management";

    // 1. Fetch leave record directly without fragile schema join dependency
    const { data: leaveDetails, error: fetchError } = await supabaseAdmin
      .from("leaves")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !leaveDetails) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    if (leaveDetails.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending leaves can be approved (currently ${leaveDetails.status})`
      });
    }

    // 2. Update status to approved in database
    const { data: updatedLeave, error: updateError } = await supabaseAdmin
      .from("leaves")
      .update({
        status: "approved",
        hr_comment: comment
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message
      });
    }

    // 3. Notify employee in background (non-blocking)
    if (process.env.EMAIL_USER && leaveDetails.employee_id) {
      supabaseAdmin
        .from("employees")
        .select("name, email")
        .eq("id", leaveDetails.employee_id)
        .maybeSingle()
        .then(({ data: emp }) => {
          if (emp?.email) {
            transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emp.email,
              subject: "Leave Request Approved",
              text: `Hello ${emp.name},\n\nYour leave request has been approved by HR.\n\nLeave Type: ${leaveDetails.leave_type}\nStart Date: ${leaveDetails.start_date}\nEnd Date: ${leaveDetails.end_date}\nDays: ${leaveDetails.days}\nHR Comment: ${comment}\n\nThank you.`
            }).catch(emailError => console.error("Employee approval email failed:", emailError.message));
          }
        })
        .catch(empError => console.warn("Employee email lookup notice:", empError.message));
    }

    res.json({
      success: true,
      data: updatedLeave,
      leave: updatedLeave,
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


// ============================================
// REJECT LEAVE - HR
// ============================================
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body.comment || req.body.hr_comment || "Rejected by HR Management";

    // 1. Fetch leave record directly without fragile schema join dependency
    const { data: leaveDetails, error: fetchError } = await supabaseAdmin
      .from("leaves")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !leaveDetails) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    if (leaveDetails.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending leaves can be rejected (currently ${leaveDetails.status})`
      });
    }

    // 2. Update status to rejected in database
    const { data: updatedLeave, error: updateError } = await supabaseAdmin
      .from("leaves")
      .update({
        status: "rejected",
        hr_comment: comment
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message
      });
    }

    // 3. Notify employee in background (non-blocking)
    if (process.env.EMAIL_USER && leaveDetails.employee_id) {
      supabaseAdmin
        .from("employees")
        .select("name, email")
        .eq("id", leaveDetails.employee_id)
        .maybeSingle()
        .then(({ data: emp }) => {
          if (emp?.email) {
            transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emp.email,
              subject: "Leave Request Rejected",
              text: `Hello ${emp.name},\n\nYour leave request has been rejected by HR.\n\nLeave Type: ${leaveDetails.leave_type}\nStart Date: ${leaveDetails.start_date}\nEnd Date: ${leaveDetails.end_date}\nDays: ${leaveDetails.days}\nHR Comment: ${comment}\n\nPlease contact HR if you have any questions.`
            }).catch(emailError => console.error("Employee rejection email failed:", emailError.message));
          }
        })
        .catch(empError => console.warn("Employee email lookup notice:", empError.message));
    }

    res.json({
      success: true,
      data: updatedLeave,
      leave: updatedLeave,
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


module.exports = {
  applyLeave,
  getLeaves,
  getPendingLeaves,
  getMyLeaves,
  approveLeave,
  rejectLeave
};
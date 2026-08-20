const { supabaseAdmin } = require("../supabase");
const PDFDocument = require("pdfkit");

// GET ALL PAYROLL
const getPayroll = async (req, res) => {
  try {
    const { data: payroll, error } = await supabaseAdmin
      .from("payroll")
      .select(`
        *,
        employees (
          name,
          email,
          department,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: payroll,
      message: "Payroll data fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the employee belonging to the logged-in user
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("id, name, email")
      .eq("user_id", userId)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found"
      });
    }

    // Get only this employee's payroll
    const { data: payroll, error: payrollError } = await supabaseAdmin
      .from("payroll")
      .select("*")
      .eq("employee_id", employee.id)
      .order("month", { ascending: false });

    if (payrollError) {
      return res.status(500).json({
        success: false,
        message: payrollError.message
      });
    }

    res.json({
      success: true,
      data: payroll,
      message: "Your payroll fetched successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// RUN PAYROLL
const runPayroll = async (req, res) => {
  try {
    const {
      employee_id,
      month,
      basic_salary,
      allowances = 0,
      deductions = 0
    } = req.body;

    if (!employee_id || !month || basic_salary === undefined) {
      return res.status(400).json({
        success: false,
        message: "employee_id, month and basic_salary are required"
      });
    }

    const net_salary =
      Number(basic_salary) +
      Number(allowances) -
      Number(deductions);

    const { data: payroll, error } = await supabaseAdmin
      .from("payroll")
      .insert([
        {
          employee_id,
          month,
          basic_salary,
          allowances,
          deductions,
          net_salary,
          status: "processed"
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
      data: payroll,
      message: "Payroll processed successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// DOWNLOAD PAYSLIP PDF
const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: payroll, error } = await supabaseAdmin
      .from("payroll")
      .select(`
        *,
        employees (
          id,
          name,
          email,
          department,
          role
        )
      `)
      .eq("id", id)
      .single();

    if (error || !payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found"
      });
    }

    const employee = payroll.employees;

    const doc = new PDFDocument({
      margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payslip-${payroll.id}.pdf"`
    );

    doc.pipe(res);

    // COMPANY
    doc
      .fontSize(20)
      .text("HR & PAYROLL SYSTEM", { align: "center" });

    doc
      .moveDown()
      .fontSize(12)
      .text("Employee Payslip", { align: "center" });

    doc.moveDown(2);

    // EMPLOYEE DETAILS
    doc.fontSize(12).text(`Employee Name: ${employee.name}`);
    doc.text(`Employee ID: ${employee.id}`);
    doc.text(`Email: ${employee.email}`);
    doc.text(`Department: ${employee.department || "N/A"}`);
    doc.text(`Role: ${employee.role || "N/A"}`);

    doc.moveDown();

    // MONTH
    doc.text(`Payroll Month: ${payroll.month}`);

    doc.moveDown(2);

    // SALARY
    doc.fontSize(14).text("Salary Breakdown");

    doc.moveDown();

    doc.fontSize(12).text(
      `Basic Salary: Rs. ${Number(payroll.basic_salary).toFixed(2)}`
    );

    doc.text(
      `Allowances: Rs. ${Number(payroll.allowances).toFixed(2)}`
    );

    doc.text(
      `Deductions: Rs. ${Number(payroll.deductions).toFixed(2)}`
    );

    doc.moveDown();

    doc
      .fontSize(14)
      .text(
        `Net Salary: Rs. ${Number(payroll.net_salary).toFixed(2)}`
      );

    doc.moveDown(3);

    doc
      .fontSize(10)
      .text(
        "This is a system-generated payslip.",
        { align: "center" }
      );

    doc.end();

  } catch (err) {
    console.error("Payslip Error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};


module.exports = {
  getPayroll,
  getMyPayroll,
  runPayroll,
  downloadPayslip
};
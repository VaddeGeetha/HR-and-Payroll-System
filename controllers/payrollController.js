const { supabaseAdmin } = require("../supabase");
const PDFDocument = require("pdfkit");

// ============================================
// GET ALL PAYROLL
// GET /api/payroll
// ============================================
const getPayroll = async (req, res) => {
  try {
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
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: payroll || []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// GET MY PAYROLL
// GET /api/payroll/my-payslips
// ============================================
const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: employee, error: employeeError } =
      await supabaseAdmin
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

    const { data: payroll, error } = await supabaseAdmin
      .from("payroll")
      .select("*")
      .eq("employee_id", employee.id)
      .order("month", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: payroll || []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// RUN PAYROLL
// POST /api/payroll/run
// Body: { month: "August", year: 2026 }
// ============================================
const runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required"
      });
    }

    const monthNumber = new Date(`${month} 1, ${year}`).getMonth();

    if (isNaN(monthNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year"
      });
    }

    const monthDate =
      `${year}-${String(monthNumber + 1).padStart(2, "0")}-01`;

    // Get all active employees
    const { data: employees, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .select("id, name, monthly_salary")
        .eq("status", "active");

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active employees found"
      });
    }

    const payrollRecords = [];

    for (const employee of employees) {

      const monthlySalary = Number(employee.monthly_salary || 0);

      // Basic = 50% of monthly salary
      const basic = monthlySalary * 0.50;

      // HRA = 40% of Basic
      const hra = basic * 0.40;

      // Fixed allowances
      const conveyance = 1600;
      const medical = 1250;

      // Special allowance = remaining amount
      const specialAllowance =
        monthlySalary - basic - hra - conveyance - medical;

      // PF = 12% of Basic
      const pf = basic * 0.12;

      // Professional Tax = ₹200
      const professionalTax = 200;

      // TDS = ₹0
      const tds = 0;

      // Health Insurance = ₹0
      const healthInsurance = 0;

      // Gross
      const grossEarnings =
        basic +
        hra +
        specialAllowance +
        conveyance +
        medical;

      // Total deductions
      const totalDeductions =
        pf +
        professionalTax +
        tds +
        healthInsurance;

      // Net salary
      const netSalary =
        grossEarnings - totalDeductions;

      payrollRecords.push({
        employee_id: employee.id,
        month: monthDate,

        // Your existing DB column
        basic_salary: Number(basic.toFixed(2)),

        // Your existing DB column
        allowances: Number(
          (
            hra +
            specialAllowance +
            conveyance +
            medical
          ).toFixed(2)
        ),

        // Your existing DB column
        deductions: Number(totalDeductions.toFixed(2)),

        net_salary: Number(netSalary.toFixed(2)),

        status: "processed",

        // Detailed breakdown already present in your table
        hra: Number(hra.toFixed(2)),
        special_allowance: Number(
          specialAllowance.toFixed(2)
        ),
        conveyance_allowance: Number(
          conveyance.toFixed(2)
        ),
        medical_allowance: Number(
          medical.toFixed(2)
        ),
        pf: Number(pf.toFixed(2)),
        professional_tax: professionalTax,
        tds: tds,
        health_insurance: healthInsurance
      });
    }

    // Insert payroll for all employees
    const { data: payroll, error: payrollError } =
      await supabaseAdmin
        .from("payroll")
        .insert(payrollRecords)
        .select();

    if (payrollError) {
      return res.status(500).json({
        success: false,
        message: payrollError.message
      });
    }

    res.status(201).json({
      success: true,
      data: payroll,
      message: `Payroll processed successfully for ${month} ${year}`
    });

  } catch (err) {
    console.error("Run Payroll Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// DOWNLOAD PAYSLIP
// GET /api/payroll/:id/download
// ============================================
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

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payslip-${payroll.id}.pdf"`
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text("HR CONNECT", { align: "center" });

    doc
      .moveDown()
      .fontSize(14)
      .text("Employee Payslip", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(12);

    doc.text(`Employee Name: ${employee.name}`);
    doc.text(`Employee ID: ${employee.id}`);
    doc.text(`Email: ${employee.email}`);
    doc.text(`Department: ${employee.department || "N/A"}`);
    doc.text(`Role: ${employee.role || "N/A"}`);

    doc.moveDown();

    doc.text(`Payroll Month: ${payroll.month}`);

    doc.moveDown(2);

    doc.fontSize(15).text("Earnings");

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Basic Salary: Rs. ${Number(payroll.basic_salary).toFixed(2)}`);
    doc.text(`HRA: Rs. ${Number(payroll.hra).toFixed(2)}`);
    doc.text(
      `Special Allowance: Rs. ${Number(payroll.special_allowance).toFixed(2)}`
    );
    doc.text(
      `Conveyance Allowance: Rs. ${Number(payroll.conveyance_allowance).toFixed(2)}`
    );
    doc.text(
      `Medical Allowance: Rs. ${Number(payroll.medical_allowance).toFixed(2)}`
    );

    doc.moveDown();

    const gross =
      Number(payroll.basic_salary || 0) +
      Number(payroll.hra || 0) +
      Number(payroll.special_allowance || 0) +
      Number(payroll.conveyance_allowance || 0) +
      Number(payroll.medical_allowance || 0);

    doc.text(`Gross Earnings: Rs. ${gross.toFixed(2)}`);

    doc.moveDown(2);

    doc.fontSize(15).text("Deductions");

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`PF: Rs. ${Number(payroll.pf).toFixed(2)}`);
    doc.text(
      `Professional Tax: Rs. ${Number(payroll.professional_tax).toFixed(2)}`
    );
    doc.text(`TDS: Rs. ${Number(payroll.tds).toFixed(2)}`);
    doc.text(
      `Health Insurance: Rs. ${Number(payroll.health_insurance).toFixed(2)}`
    );

    doc.moveDown();

    doc.text(
      `Total Deductions: Rs. ${Number(payroll.deductions).toFixed(2)}`
    );

    doc.moveDown(2);

    doc
      .fontSize(16)
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
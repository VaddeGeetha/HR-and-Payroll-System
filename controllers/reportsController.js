const { supabaseAdmin } = require("../supabase");

const getReports = async (req, res) => {
  try {
    // -----------------------------
    // EMPLOYEE REPORT
    // -----------------------------
    const { data: employees, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .select("id, name, department, status, joining_date, created_at");

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    const activeEmployees = (employees || []).filter(
      employee => employee.status === "active"
    );

    // -----------------------------
    // DEPARTMENT REPORT
    // -----------------------------
    const departmentCounts = {};

    activeEmployees.forEach(employee => {
      const department = employee.department || "Unknown";

      departmentCounts[department] =
        (departmentCounts[department] || 0) + 1;
    });

    // -----------------------------
    // LEAVE REPORT
    // -----------------------------
    const { data: leaves, error: leaveError } =
      await supabaseAdmin
        .from("leaves")
        .select("id, leave_type, days, status, created_at");

    if (leaveError) {
      return res.status(500).json({
        success: false,
        message: leaveError.message
      });
    }

    const leaveSummary = {
      total: leaves?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    (leaves || []).forEach(leave => {
      if (leave.status === "pending") {
        leaveSummary.pending++;
      } else if (leave.status === "approved") {
        leaveSummary.approved++;
      } else if (leave.status === "rejected") {
        leaveSummary.rejected++;
      }
    });

    // -----------------------------
    // PAYROLL REPORT
    // -----------------------------
    const { data: payroll, error: payrollError } =
      await supabaseAdmin
        .from("payroll")
        .select(`
          id,
          employee_id,
          month,
          basic_salary,
          allowances,
          deductions,
          net_salary,
          status
        `);

    if (payrollError) {
      return res.status(500).json({
        success: false,
        message: payrollError.message
      });
    }

    const totalPayroll = (payroll || []).reduce(
      (sum, record) =>
        sum + Number(record.net_salary || 0),
      0
    );

    // -----------------------------
    // REPORT RESPONSE
    // -----------------------------
    res.json({
      success: true,

      data: {
        summary: {
          totalEmployees: activeEmployees.length,
          totalDepartments: Object.keys(departmentCounts).length,
          totalLeaves: leaveSummary.total,
          totalPayroll: totalPayroll
        },

        employees: {
          total: activeEmployees.length,
          byDepartment: departmentCounts
        },

        leaves: leaveSummary,

        payroll: {
          totalRecords: payroll?.length || 0,
          totalPayroll: totalPayroll,
          records: payroll || []
        }
      },

      message: "Reports fetched successfully"
    });

  } catch (err) {
    console.error("Reports Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getReports
};
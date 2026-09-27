const { supabaseAdmin } = require("../supabase");

// ============================================
// GET DASHBOARD STATS
// GET /api/dashboard/stats
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    // Total employees
    const { count: totalEmployees, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    // Get departments
    const { data: employees, error: departmentsError } =
      await supabaseAdmin
        .from("employees")
        .select("department")
        .eq("status", "active");

    if (departmentsError) {
      return res.status(500).json({
        success: false,
        message: departmentsError.message
      });
    }

    const departments = new Set(
      (employees || [])
        .map(employee => employee.department)
        .filter(Boolean)
    );

    // Current month
    const now = new Date();

    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // Leaves this month
    const { data: leaves, error: leaveError } =
      await supabaseAdmin
        .from("leaves")
        .select("id")
        .gte("created_at", firstDay.toISOString())
        .lt("created_at", nextMonth.toISOString());

    if (leaveError) {
      return res.status(500).json({
        success: false,
        message: leaveError.message
      });
    }

    // Monthly payroll
    const startDate =
      `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01`;

    const { data: payroll, error: payrollError } =
      await supabaseAdmin
        .from("payroll")
        .select("net_salary")
        .eq("month", startDate);

    if (payrollError) {
      return res.status(500).json({
        success: false,
        message: payrollError.message
      });
    }

    const monthlyPayroll = (payroll || []).reduce(
      (total, record) =>
        total + Number(record.net_salary || 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalEmployees: totalEmployees || 0,
        totalDepartments: departments.size,
        leavesThisMonth: leaves?.length || 0,
        monthlyPayroll: monthlyPayroll
      },
      message: "Dashboard statistics fetched successfully"
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// GET DASHBOARD CHARTS
// GET /api/dashboard/charts
// ============================================
const getDashboardCharts = async (req, res) => {
  try {

    // ------------------------------------------
    // EMPLOYEES BY DEPARTMENT
    // ------------------------------------------

    const { data: employees, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .select("department")
        .eq("status", "active");

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    const departmentNames = [
      "IT",
      "HR",
      "Finance",
      "Sales",
      "Marketing",
      "Operations"
    ];

    const departmentCounts = departmentNames.map(
      department =>
        (employees || []).filter(
          employee =>
            employee.department === department
        ).length
    );


    // ------------------------------------------
    // EMPLOYEE GROWTH
    // Last 12 months
    // ------------------------------------------

    const employeeGrowth = [];

    for (let i = 11; i >= 0; i--) {

      const date = new Date();

      date.setMonth(
        date.getMonth() - i
      );

      const endDate = new Date(date);

      endDate.setMonth(
        endDate.getMonth() + 1
      );

      const { count, error } =
        await supabaseAdmin
          .from("employees")
          .select("*", {
            count: "exact",
            head: true
          })
          .lt(
            "created_at",
            endDate.toISOString()
          );

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      employeeGrowth.push(count || 0);
    }


    // ------------------------------------------
    // MONTHLY PAYROLL
    // Last 12 months
    // ------------------------------------------

    const monthlyPayroll = [];

    for (let i = 11; i >= 0; i--) {

      const date = new Date();

      date.setMonth(
        date.getMonth() - i
      );

      const year = date.getFullYear();

      const month =
        date.getMonth() + 1;

      const monthDate =
        `${year}-${String(month).padStart(
          2,
          "0"
        )}-01`;

      const { data: payroll, error } =
        await supabaseAdmin
          .from("payroll")
          .select("net_salary")
          .eq("month", monthDate);

      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      const total =
        (payroll || []).reduce(
          (sum, record) =>
            sum + Number(
              record.net_salary || 0
            ),
          0
        );

      monthlyPayroll.push(total);
    }


    res.json({
      success: true,
      data: {
        departments: departmentNames,
        departmentCounts,
        employeeGrowth,
        monthlyPayroll
      },
      message: "Dashboard charts fetched successfully"
    });

  } catch (err) {
    console.error("Dashboard Charts Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ============================================
// WORK FROM HOME (WFH) TRACKING CONTROLLERS
// ============================================
const wfhSessions = new Map();

const startWFH = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.body?.email || "employee").toLowerCase();
    const startTime = req.body?.startTime || Date.now();
    const session = {
      email: userEmail,
      active: true,
      startTime: startTime,
      startDate: new Date(startTime).toISOString(),
      endTime: null,
      durationSeconds: 0
    };
    wfhSessions.set(userEmail, session);

    res.json({
      success: true,
      data: session,
      session,
      message: "WFH started successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const stopWFH = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.body?.email || "employee").toLowerCase();
    const session = wfhSessions.get(userEmail) || {
      startTime: req.body?.startTime || Date.now(),
      active: true
    };
    const endTime = Date.now();
    const durationSeconds = Math.max(0, Math.floor((endTime - (session.startTime || endTime)) / 1000));

    const updatedSession = {
      email: userEmail,
      active: false,
      startTime: session.startTime,
      endTime: endTime,
      durationSeconds: durationSeconds,
      completedAt: new Date(endTime).toISOString()
    };
    wfhSessions.set(userEmail, updatedSession);

    res.json({
      success: true,
      data: updatedSession,
      session: updatedSession,
      message: "WFH ended successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWFHStatus = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.query?.email || "employee").toLowerCase();
    const session = wfhSessions.get(userEmail) || {
      active: false,
      startTime: null,
      durationSeconds: 0
    };
    res.json({
      success: true,
      data: session,
      session
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  startWFH,
  stopWFH,
  getWFHStatus
};
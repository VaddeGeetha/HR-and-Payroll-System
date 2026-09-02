const { supabase, supabaseAdmin } = require("../supabase");

// ============================================
// GET ALL EMPLOYEES
// GET /api/employees
// ============================================
const getEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    let query = supabaseAdmin
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      employees: data || []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// ADD EMPLOYEE
// POST /api/employees
// ============================================
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dob,
      joining_date,
      department,
      designation,
      employment_type,
      annual_ctc,
      monthly_salary,
      pan,
      aadhaar,
      passport,
      address,
      bank_name,
      account_number,
      ifsc,
      photo,
      status
    } = req.body;

    // ----------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------
    if (
      !name ||
      !email ||
      !phone ||
      !pan ||
      !aadhaar ||
      !photo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, email, phone, pan, aadhaar and photo are required"
      });
    }

    // ----------------------------------------
    // PAN VALIDATION
    // Example: ABCDE1234F
    // ----------------------------------------
    const panValue = pan.toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panValue)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format"
      });
    }

    // ----------------------------------------
    // AADHAAR VALIDATION
    // Allows spaces: 1234 5678 9012
    // ----------------------------------------
    const aadhaarValue = aadhaar.replace(/\s/g, "");

    if (!/^\d{12}$/.test(aadhaarValue)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar must contain 12 digits"
      });
    }

    // ----------------------------------------
    // CHECK EXISTING EMPLOYEE
    // ----------------------------------------
    const { data: existingEmployee } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists"
      });
    }

    // ----------------------------------------
    // CREATE SUPABASE AUTH USER
    // ----------------------------------------
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: "employee123",
        email_confirm: true
      });

    if (authError || !authData?.user) {
      return res.status(500).json({
        success: false,
        message:
          authError?.message || "User creation failed"
      });
    }

    const userId = authData.user.id;

    // ----------------------------------------
    // CREATE PROFILE
    // ----------------------------------------
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: name,
          email,
          role: "employee"
        }
      ]);

    if (profileError) {

      // Roll back Auth user if profile fails
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return res.status(500).json({
        success: false,
        message: profileError.message
      });
    }

    // ----------------------------------------
    // CREATE EMPLOYEE RECORD
    // ----------------------------------------
    const { data: employee, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .insert([
          {
            user_id: userId,
            name,
            email,
            phone,
            gender,
            dob,
            joining_date,
            department,
            designation,
            employment_type,
            annual_ctc,
            monthly_salary,
            pan: panValue,
            aadhaar: aadhaarValue,
            passport,
            address,
            bank_name,
            account_number,
            ifsc,
            photo,
            status: status || "active",
            role: "employee"
          }
        ])
        .select()
        .single();

    if (employeeError) {

      // Roll back profile + auth user
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------
    res.status(201).json({
      success: true,
      data: employee,
      message: "Employee created successfully"
    });

  } catch (err) {
    console.error("Add Employee Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// UPDATE EMPLOYEE
// PUT /api/employees/:id
// ============================================
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      gender,
      dob,
      joining_date,
      department,
      designation,
      employment_type,
      annual_ctc,
      monthly_salary,
      pan,
      aadhaar,
      passport,
      address,
      bank_name,
      account_number,
      ifsc,
      photo,
      status
    } = req.body;

    // ----------------------------------------
    // FIND EMPLOYEE
    // ----------------------------------------
    const { data: existingEmployee, error: findError } =
      await supabaseAdmin
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

    if (findError || !existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // ----------------------------------------
    // VALIDATE PAN IF PROVIDED
    // ----------------------------------------
    let panValue = pan;

    if (pan) {
      panValue = pan.toUpperCase();

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panValue)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PAN format"
        });
      }
    }

    // ----------------------------------------
    // VALIDATE AADHAAR IF PROVIDED
    // ----------------------------------------
    let aadhaarValue = aadhaar;

    if (aadhaar) {
      aadhaarValue = aadhaar.replace(/\s/g, "");

      if (!/^\d{12}$/.test(aadhaarValue)) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar must contain 12 digits"
        });
      }
    }

    // ----------------------------------------
    // UPDATE EMPLOYEE
    // ----------------------------------------
    const updateData = {
      name,
      email,
      phone,
      gender,
      dob,
      joining_date,
      department,
      designation,
      employment_type,
      annual_ctc,
      monthly_salary,
      pan: panValue,
      aadhaar: aadhaarValue,
      passport,
      address,
      bank_name,
      account_number,
      ifsc,
      photo,
      status
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: employee, error: employeeError } =
      await supabaseAdmin
        .from("employees")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    // ----------------------------------------
    // UPDATE PROFILE
    // ----------------------------------------
    const profileUpdate = {};

    if (name !== undefined) {
      profileUpdate.full_name = name;
    }

    if (email !== undefined) {
      profileUpdate.email = email;
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } =
        await supabaseAdmin
          .from("profiles")
          .update(profileUpdate)
          .eq("id", existingEmployee.user_id);

      if (profileError) {
        return res.status(500).json({
          success: false,
          message: profileError.message
        });
      }
    }

    res.json({
      success: true,
      data: employee,
      message: "Employee updated successfully"
    });

  } catch (err) {
    console.error("Update Employee Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ============================================
// DELETE / DEACTIVATE EMPLOYEE
// DELETE /api/employees/:id
// ============================================
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employee
    const { data: employee, error: findError } =
      await supabaseAdmin
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

    if (findError || !employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // ----------------------------------------
    // FRONTEND SAYS DELETE / DEACTIVATE
    // We deactivate instead of permanently deleting.
    // ----------------------------------------
    const { error } = await supabaseAdmin
      .from("employees")
      .update({
        status: "inactive"
      })
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "Employee deactivated successfully"
    });

  } catch (err) {
    console.error("Delete Employee Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
};
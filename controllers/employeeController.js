const { supabase, supabaseAdmin} = require("../supabase");

const getEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    let query = supabaseAdmin
      .from("employees")
      .select("*")
      .order("id", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      employees: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const addEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            role = "employee",
            monthly_salary = 50000,
            joining_date,
            phone,
            gender,
            dob,
            designation,
            employment_type,
            annual_ctc,
            pan,
            aadhaar,
            passport,
            photo,
            status = "active",
            bank_details
        } = req.body;

        const bank_name = req.body.bank_name || bank_details?.bank_name || null;
        const account_number = req.body.account_number || bank_details?.account_number || null;

        // Check if employee already exists
        const { data: existing } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Employee already exists"
            });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password: "employee123",
                email_confirm: true
            });

        if (authError || !authData?.user) {
            return res.status(500).json({
                success: false,
                message: authError?.message || "User creation failed"
            });
        }

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert([
                {
                    id: authData.user.id,
                    full_name: name,
                    email,
                    role
                }
            ]);

        if (profileError) {
            return res.status(500).json({
                success: false,
                message: profileError.message
            });
        }

        const { data: employee, error: employeeError } = await supabaseAdmin
            .from("employees")
            .insert([
                {
                    user_id: authData.user.id,
                    name,
                    email,
                    department,
                    role,
                    monthly_salary,
                    joining_date: joining_date || new Date().toISOString().split('T')[0],
                    phone: phone || null,
                    gender: gender || null,
                    dob: dob || null,
                    designation: designation || null,
                    employment_type: employment_type || null,
                    annual_ctc: annual_ctc || null,
                    pan: pan || null,
                    aadhaar: aadhaar || null,
                    passport: passport || null,
                    photo: photo || null,
                    status: status || "active",
                    bank_name,
                    account_number
                }
            ])
            .select()
            .single();

        if (employeeError) {
            return res.status(500).json({
                success: false,
                message: employeeError.message
            });
        }

        res.json({
            success: true,
            message: "Employee created successfully",
            employee
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      department,
      role,
      monthly_salary,
      joining_date,
      phone,
      gender,
      dob,
      designation,
      employment_type,
      annual_ctc,
      pan,
      aadhaar,
      passport,
      photo,
      status,
      bank_details
    } = req.body;

    const bank_name = req.body.bank_name || bank_details?.bank_name;
    const account_number = req.body.account_number || bank_details?.account_number;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (department !== undefined) updatePayload.department = department;
    if (role !== undefined) updatePayload.role = role;
    if (monthly_salary !== undefined) updatePayload.monthly_salary = monthly_salary;
    if (joining_date !== undefined) updatePayload.joining_date = joining_date;
    if (phone !== undefined) updatePayload.phone = phone;
    if (gender !== undefined) updatePayload.gender = gender;
    if (dob !== undefined) updatePayload.dob = dob;
    if (designation !== undefined) updatePayload.designation = designation;
    if (employment_type !== undefined) updatePayload.employment_type = employment_type;
    if (annual_ctc !== undefined) updatePayload.annual_ctc = annual_ctc;
    if (pan !== undefined) updatePayload.pan = pan;
    if (aadhaar !== undefined) updatePayload.aadhaar = aadhaar;
    if (passport !== undefined) updatePayload.passport = passport;
    if (photo !== undefined) updatePayload.photo = photo;
    if (status !== undefined) updatePayload.status = status;
    if (bank_name !== undefined) updatePayload.bank_name = bank_name;
    if (account_number !== undefined) updatePayload.account_number = account_number;

    // Update employees table
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message,
      });
    }

    // Update profiles table if profile exists
    if (employee?.user_id) {
      const profileUpdates = {};
      if (name !== undefined) profileUpdates.full_name = name;
      if (email !== undefined) profileUpdates.email = email;
      if (role !== undefined) profileUpdates.role = role;

      if (Object.keys(profileUpdates).length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("id", employee.user_id);
      }
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: employee, error: findError } = await supabaseAdmin
      .from("employees")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (findError || !employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete from employees table
    const { error: empDeleteError } = await supabaseAdmin
      .from("employees")
      .delete()
      .eq("id", id);

    if (empDeleteError) {
      return res.status(500).json({
        success: false,
        message: empDeleteError.message,
      });
    }

    // Delete profile
    if (employee.user_id) {
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", employee.user_id);

      // Delete auth user if admin client available
      try {
        await supabaseAdmin.auth.admin.deleteUser(employee.user_id);
      } catch (authErr) {
        console.warn("Auth user delete warning:", authErr.message);
      }
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};
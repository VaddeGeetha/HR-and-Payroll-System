const { supabase, supabaseAdmin} = require("../supabase");

const getEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    let query = supabase
      .from("employees")
      .select("*");

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
      employees: data,
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
            role,
            monthly_salary,
            joining_date
        } = req.body;

        // Check if employee already exists
        const { data: existing } = await supabase
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
    console.log("Auth Data:", authData);
console.log("Auth Error:", authError);
if (authError || !authData?.user) {
    return res.status(500).json({
        success: false,
        message: authError?.message || "User creation failed"
    });
}
    const { error: profileError } = await supabase
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
const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .insert([
        {
            user_id: authData.user.id,
            name,
            email,
            department,
            role,
            monthly_salary,
            joining_date
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

if (authError) {
    return res.status(500).json({
        success: false,
        message: authError.message
    });
}

res.json({
    success: true,
    message: "employee created successfully",
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
    } = req.body;

    // Update employees table
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .update({
        name,
        email,
        department,
        role,
        monthly_salary,
        joining_date,
      })
      .eq("id", id)
      .select()
      .single();

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message,
      });
    }

    // Update profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: name,
        email,
        role,
      })
      .eq("id", employee.user_id);

    if (profileError) {
      return res.status(500).json({
        success: false,
        message: profileError.message,
      });
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

    // Get employee first
    const { data: employee, error: fetchError } = await supabaseAdmin
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Delete from employees table
    const { error: employeeError } = await supabaseAdmin
      .from("employees")
      .delete()
      .eq("id", id);

    if (employeeError) {
      return res.status(500).json({
        success: false,
        message: employeeError.message
      });
    }

    // Delete from profiles table
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", employee.user_id);

    // Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(employee.user_id);

    res.json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (err) {
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
  deleteEmployee,
};
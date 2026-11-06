
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET all employees
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("employee_id", { ascending: true });

    if (error) throw error;

    res.status(200).json({
      message: "Employees fetched successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// GET employee by ID
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("employee_id", req.params.id)
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Employee fetched successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// CREATE employee
router.post("/", async (req, res) => {
  try {
    const { name, role, factory_id } = req.body;

    if (!name || !role || !factory_id) {
      return res.status(400).json({
        message: "Name, role and factory are required"
      });
    }

    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          name,
          role,
          factory_id: Number(factory_id)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Employee created successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// UPDATE employee
router.put("/:id", async (req, res) => {
  try {
    const { name, role, factory_id } = req.body;

    if (!name || !role || !factory_id) {
      return res.status(400).json({
        message: "Name, role and factory are required"
      });
    }

    const { data, error } = await supabase
      .from("employees")
      .update({
        name,
        role,
        factory_id: Number(factory_id)
      })
      .eq("employee_id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Employee updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// DELETE employee
router.delete("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("employees")
      .delete()
      .eq("employee_id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Employee deleted successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;


import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all task routes
router.use(authMiddleware);

// CREATE a new task
router.post("/", async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      category,
      dueDate,
      priority,
      completed,
    } = req.body;

    if (!title?.trim() || !subject?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const newTask = await Task.create({
      title,
      subject,
      description: description || "",
      category,
      dueDate,
      priority,
      completed,
      owner: req.userId,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.log("Create Task Error:", error);

    return res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// GET all tasks belonging to logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({
      owner: req.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    console.log("Fetch Tasks Error:", error);

    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});

// GET a single task belonging to logged-in user
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.log("Fetch Single Task Error:", error);

    return res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
});

// UPDATE a task
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const allowedFields = [
      "title",
      "subject",
      "description",
      "category",
      "dueDate",
      "priority",
      "completed",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId,
      },
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log("Update Task Error:", error);

    return res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    console.log("Delete Task Error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});

export default router;

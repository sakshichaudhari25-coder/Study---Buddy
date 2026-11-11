
import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { isRequestBody, isValidDueDate } from "../utils/validation.js";
import sendApiError from "../utils/sendApiError.js";

const router = express.Router();

const categories = new Set([
  "Homework",
  "Project",
  "Exam",
  "Practical",
  "Presentation",
]);
const priorities = new Set(["Low", "Medium", "High"]);
const taskFields = new Set([
  "title",
  "subject",
  "description",
  "category",
  "dueDate",
  "priority",
  "completed",
]);

function validateTaskInput(body, partial = false) {
  if (!isRequestBody(body)) return { error: "Please provide valid task data" };

  const fields = Object.keys(body);
  if (fields.some((field) => !taskFields.has(field))) {
    return { error: "Request contains unsupported task fields" };
  }

  if (partial && fields.length === 0) {
    return { error: "Provide at least one task field to update" };
  }

  if (
    !partial &&
    (!Object.hasOwn(body, "title") ||
      !Object.hasOwn(body, "subject") ||
      !Object.hasOwn(body, "dueDate"))
  ) {
    return { error: "Title, subject, and due date are required" };
  }

  const normalized = {};

  if (Object.hasOwn(body, "title")) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 160) {
      return { error: "Title must be between 1 and 160 characters" };
    }
    normalized.title = body.title.trim();
  }

  if (Object.hasOwn(body, "subject")) {
    if (
      typeof body.subject !== "string" ||
      !body.subject.trim() ||
      body.subject.trim().length > 120
    ) {
      return { error: "Subject must be between 1 and 120 characters" };
    }
    normalized.subject = body.subject.trim();
  }

  if (Object.hasOwn(body, "description")) {
    if (typeof body.description !== "string" || body.description.length > 2000) {
      return { error: "Description must be 2000 characters or fewer" };
    }
    normalized.description = body.description.trim();
  }

  if (Object.hasOwn(body, "category")) {
    if (typeof body.category !== "string" || !categories.has(body.category)) {
      return { error: "Please choose a valid task category" };
    }
    normalized.category = body.category;
  }

  if (Object.hasOwn(body, "dueDate")) {
    if (!isValidDueDate(body.dueDate)) {
      return { error: "Please provide a valid due date" };
    }
    normalized.dueDate = body.dueDate;
  }

  if (Object.hasOwn(body, "priority")) {
    if (typeof body.priority !== "string" || !priorities.has(body.priority)) {
      return { error: "Please choose a valid task priority" };
    }
    normalized.priority = body.priority;
  }

  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      return { error: "Task completion status must be true or false" };
    }
    normalized.completed = body.completed;
  }

  return { data: normalized };
}

// Protect all task routes
router.use(authMiddleware);

// CREATE a new task
router.post("/", async (req, res) => {
  try {
    const validation = validateTaskInput(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const newTask = await Task.create({
      ...validation.data,
      owner: req.userId,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    return sendApiError(res, error, "Create task");
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
    return sendApiError(res, error, "Fetch tasks");
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
    return sendApiError(res, error, "Fetch task");
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

    const validation = validateTaskInput(req.body, true);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId,
      },
      validation.data,
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
    return sendApiError(res, error, "Update task");
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
    return sendApiError(res, error, "Delete task");
  }
});

export default router;

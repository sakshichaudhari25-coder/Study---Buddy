
import { useState, useEffect, useCallback } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,
} from "./api/taskApi";
import { getApiErrorMessage } from "./api/apiClient";

import Header from "./Components/Header";
import Stats from "./Components/Stats";
import TaskForm from "./Components/TaskForm";
import TaskList from "./Components/TaskList";
import UpcomingTasks from "./Components/UpcomingTasks";
import CalendarView from "./Components/CalendarView";
import TaskReminders from "./Components/TaskReminders";
import Analytics from "./Components/Analytics";
import exportTasks from "./utils/exportTasks";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgetPassword";
import ResetPassword from "./Pages/ResetPassword";
import Profile from "./Pages/Profile";

import "./App.css";

function getSavedUser() {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function App() {
  // Authentication
  const [user, setUser] = useState(getSavedUser);

  const [authPage, setAuthPage] = useState("login");
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(Boolean(user));
  const [taskLoadError, setTaskLoadError] = useState("");
  const [taskReloadKey, setTaskReloadKey] = useState(0);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [activeTaskActionId, setActiveTaskActionId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Task form states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Homework");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [editingTaskId, setEditingTaskId] = useState(null);

  // Dark Mode / Light Mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("studybuddy-theme") || "dark";
  });

  const resetForm = useCallback(() => {
    setTitle("");
    setSubject("");
    setDescription("");
    setCategory("Homework");
    setDueDate("");
    setPriority("Medium");
    setEditingTaskId(null);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);
    setIsLoadingTasks(false);
    setTaskLoadError("");
    setFeedback(null);
    setShowProfile(false);
    resetForm();
  }, [resetForm]);

  // Apply and save selected theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("studybuddy-theme", theme);
  }, [theme]);

  // Toggle theme
  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }

  const userId = user?.id;

  // Fetch tasks when the authenticated account changes.
  useEffect(() => {
    if (!userId) return undefined;

    async function fetchTasks() {
      try {
        const response = await getTasks({ signal: controller.signal });
        setTasks(Array.isArray(response.data.tasks) ? response.data.tasks : []);
        setTaskLoadError("");
      } catch (error) {
        if (error.code !== "ERR_CANCELED" && error.response?.status !== 401) {
          const message = getApiErrorMessage(error, "Unable to load your tasks.");
          setTaskLoadError(message);
          setFeedback({
            type: "error",
            message,
          });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingTasks(false);
      }
    }

    const controller = new AbortController();
    fetchTasks();
    return () => controller.abort();
  }, [taskReloadKey, userId]);

  useEffect(() => {
    window.addEventListener("studybuddy:unauthorized", handleLogout);
    return () =>
      window.removeEventListener("studybuddy:unauthorized", handleLogout);
  }, [handleLogout]);

  // Login success
  function handleLogin(loggedInUser) {
    setTasks([]);
    setIsLoadingTasks(true);
    setTaskLoadError("");
    setFeedback(null);
    setUser(loggedInUser);
    setAuthPage("login");
  }

  // Logout
  // Update profile information
  function handleProfileUpdate(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  // Create or update task
  async function handleSubmit(e) {
    e.preventDefault();
    if (isSavingTask) return;

    if (!title.trim() || !subject.trim() || !dueDate) {
      setFeedback({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    const taskData = {
      title,
      subject,
      description,
      category,
      dueDate,
      priority,
    };

    try {
      setIsSavingTask(true);
      setFeedback(null);

      if (editingTaskId) {
        const response = await updateTask(editingTaskId, taskData);

        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task._id === editingTaskId
              ? response.data.task
              : task
          )
        );

        setFeedback({ type: "success", message: "Task updated successfully." });
      } else {
        const response = await createTask({
          ...taskData,
          completed: false,
        });

        setTasks((previousTasks) => [
          response.data.task,
          ...previousTasks,
        ]);

        setFeedback({ type: "success", message: "Task added successfully." });
      }

      resetForm();
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      } else {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(error, "Unable to save your task."),
        });
      }
    } finally {
      setIsSavingTask(false);
    }
  }

  // Edit task
  function editTask(task) {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setSubject(task.subject);
    setDescription(task.description || "");
    setCategory(task.category || "Homework");
    setDueDate(task.dueDate.split("T")[0]);
    setPriority(task.priority);
  }

  // Mark completed or pending
  async function toggleComplete(id) {
    if (activeTaskActionId) return;

    try {
      const currentTask = tasks.find(
        (task) => task._id === id
      );

      if (!currentTask) return;

      setActiveTaskActionId(id);
      setFeedback(null);
      const response = await updateTask(id, {
        completed: !currentTask.completed,
      });

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? response.data.task : task
        )
      );
      setFeedback({
        type: "success",
        message: currentTask.completed
          ? "Task marked as pending."
          : "Task marked as completed.",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      } else {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(error, "Unable to update the task."),
        });
      }
    } finally {
      setActiveTaskActionId(null);
    }
  }

  // Delete task
  async function deleteTask(id) {
    if (activeTaskActionId) return;

    try {
      setActiveTaskActionId(id);
      setFeedback(null);
      await deleteTaskAPI(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );

      if (editingTaskId === id) {
        resetForm();
      }
      setFeedback({ type: "success", message: "Task deleted successfully." });
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      } else {
        setFeedback({
          type: "error",
          message: getApiErrorMessage(error, "Unable to delete the task."),
        });
      }
    } finally {
      setActiveTaskActionId(null);
    }
  }

  function handleExportTasks() {
    const exported = exportTasks(tasks);
    setFeedback(
      exported
        ? { type: "success", message: "Your assignments were exported." }
        : { type: "error", message: "There are no assignments to export yet." }
    );
  }

  function retryTaskLoad() {
    setTaskLoadError("");
    setIsLoadingTasks(true);
    setFeedback(null);
    setTaskReloadKey((currentKey) => currentKey + 1);
  }

  // Show Login / Register when user is not logged in
  if (!user) {
    if (window.location.pathname.startsWith("/reset-password")) {
      return (
        <ResetPassword
          theme={theme}
          toggleTheme={toggleTheme}
          onShowLogin={() => {
            window.location.href = "/";
          }}
        />
      );
    }

    if (authPage === "register") {
      return (
        <Register
          theme={theme}
          toggleTheme={toggleTheme}
          onShowLogin={() => setAuthPage("login")}
        />
      );
    }

    if (authPage === "forgot") {
      return (
        <ForgotPassword
          theme={theme}
          toggleTheme={toggleTheme}
          onShowLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        theme={theme}
        toggleTheme={toggleTheme}
        onLogin={handleLogin}
        onShowRegister={() => setAuthPage("register")}
        onShowForgotPassword={() => setAuthPage("forgot")}
      />
    );
  }

  // Show Profile Page
  if (showProfile) {
    return (
      <div className="app">
        <Profile
          user={user}
          onProfileUpdate={handleProfileUpdate}
          onBack={() => setShowProfile(false)}
        />
      </div>
    );
  }

  // StudyBuddy Dashboard
  return (
    <div className="app">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onProfileClick={() => setShowProfile(true)}
      />

      <main className="container">
        <div className="welcome-user">
          <h1>My Tasks</h1>

          <p>
            Welcome, {user.name}!
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>

        <p className="subtitle">
          Organize your assignments and stay on track.
        </p>

        {feedback && (
          <div
            className={feedback.type === "error" ? "profile-error" : "profile-success"}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </div>
        )}

        {isLoadingTasks && <p role="status">Loading your tasks...</p>}

        <div id="overview">
          <Stats tasks={tasks} />
        </div>

        <Analytics tasks={tasks} />

        <div className="export-container">
          <button
            type="button"
            className="export-button"
            onClick={handleExportTasks}
          >
            📥 Export Assignments
          </button>
        </div>

        <TaskReminders tasks={tasks} />

        <div id="calendar">
          <CalendarView tasks={tasks} />
        </div>

        <div id="upcoming">
          <UpcomingTasks tasks={tasks} />
        </div>

        <div id="add-task">
          <TaskForm
            title={title}
            setTitle={setTitle}
            subject={subject}
            setSubject={setSubject}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            dueDate={dueDate}
            setDueDate={setDueDate}
            priority={priority}
            setPriority={setPriority}
            handleSubmit={handleSubmit}
            editingTaskId={editingTaskId}
            resetForm={resetForm}
            isSaving={isSavingTask}
          />
        </div>

        <div id="assignments">
          <TaskList
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            editTask={editTask}
            isLoading={isLoadingTasks}
            loadError={taskLoadError}
            onRetryLoad={retryTaskLoad}
            activeTaskActionId={activeTaskActionId}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

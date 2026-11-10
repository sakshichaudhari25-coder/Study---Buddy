
import { useState, useEffect } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,
} from "./api/taskApi";

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

function App() {
  // Authentication
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authPage, setAuthPage] = useState("login");
  const [tasks, setTasks] = useState([]);
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

  // Fetch tasks only after login
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    async function fetchTasks() {
      try {
        const response = await getTasks();
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.log("Error fetching tasks:", error);

        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    }

    fetchTasks();
  }, [user]);

  // Login success
  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setAuthPage("login");
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setTasks([]);
    setShowProfile(false);

    resetForm();
  }

  // Update profile information
  function handleProfileUpdate(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  // Create or update task
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !subject.trim() || !dueDate) {
      alert("Please fill in all required fields");
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
      if (editingTaskId) {
        const response = await updateTask(editingTaskId, taskData);

        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task._id === editingTaskId
              ? response.data.task
              : task
          )
        );

        alert("Task updated successfully!");
      } else {
        const response = await createTask({
          ...taskData,
          completed: false,
        });

        setTasks((previousTasks) => [
          response.data.task,
          ...previousTasks,
        ]);

        alert("Task added successfully!");
      }

      resetForm();
    } catch (error) {
      console.log("Error saving task:", error);

      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert("Unable to save task");
      }
    }
  }

  // Clear form
  function resetForm() {
    setTitle("");
    setSubject("");
    setDescription("");
    setCategory("Homework");
    setDueDate("");
    setPriority("Medium");
    setEditingTaskId(null);
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
    try {
      const currentTask = tasks.find(
        (task) => task._id === id
      );

      if (!currentTask) return;

      const response = await updateTask(id, {
        completed: !currentTask.completed,
      });

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? response.data.task : task
        )
      );
    } catch (error) {
      console.log("Error updating task:", error);

      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert("Unable to update task");
      }
    }
  }

  // Delete task
  async function deleteTask(id) {
    try {
      await deleteTaskAPI(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );

      if (editingTaskId === id) {
        resetForm();
      }
    } catch (error) {
      console.log("Error deleting task:", error);

      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert("Unable to delete task");
      }
    }
  }

  // Show Login / Register when user is not logged in
  if (!user) {
    if (window.location.pathname.startsWith("/reset-password")) {
      return (
        <ResetPassword
          onShowLogin={() => {
            window.location.href = "/";
          }}
        />
      );
    }

    if (authPage === "register") {
      return (
        <Register
          onShowLogin={() => setAuthPage("login")}
        />
      );
    }

    if (authPage === "forgot") {
      return (
        <ForgotPassword
          onShowLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
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

        <div id="overview">
          <Stats tasks={tasks} />
        </div>

        <Analytics tasks={tasks} />

        <div className="export-container">
          <button
            type="button"
            className="export-button"
            onClick={() => exportTasks(tasks)}
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
          />
        </div>

        <div id="assignments">
          <TaskList
            tasks={tasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            editTask={editTask}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

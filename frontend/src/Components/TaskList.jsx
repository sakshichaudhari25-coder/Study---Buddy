
import { useState } from "react";

function TaskList({
  tasks,
  toggleComplete,
  deleteTask,
  editTask,
  isLoading,
  loadError,
  onRetryLoad,
  activeTaskActionId,
}) {
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  function isOverdue(task) {
    if (task.completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.subject.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (task.category || "Homework").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Pending" && !task.completed) ||
      (filter === "Completed" && task.completed) ||
      (filter === "High Priority" && task.priority === "High") ||
      (filter === "Overdue" && isOverdue(task));

    const matchesCategory =
      categoryFilter === "All Categories" ||
      (task.category || "Homework") === categoryFilter;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case "earliest":
        return new Date(a.dueDate) - new Date(b.dueDate);

      case "latest":
        return new Date(b.dueDate) - new Date(a.dueDate);

      case "priority": {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  function toggleDescription(taskId) {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }

  function closeDetails() {
    setSelectedTask(null);
  }

  return (
    <section className="task-section">
      <h2>My Assignments</h2>

      <input
        type="text"
        aria-label="Search assignments"
        placeholder="Search by task title, subject or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-buttons">
        {["All", "Pending", "Completed", "High Priority", "Overdue"].map(
          (item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? "active-filter" : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Category Filter */}
      <div className="sort-container">
        <label htmlFor="category-filter">Filter by Category:</label>

        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All Categories">All Categories</option>
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
          <option value="Exam">Exam</option>
          <option value="Practical">Practical</option>
          <option value="Presentation">Presentation</option>
        </select>
      </div>

      {/* Sorting */}
      <div className="sort-container">
        <label htmlFor="task-sort">Sort tasks:</label>

        <select
          id="task-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Recently Added</option>
          <option value="earliest">Earliest Due Date</option>
          <option value="latest">Latest Due Date</option>
          <option value="priority">High Priority First</option>
        </select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <p role="status">Loading your assignments...</p>
      ) : loadError ? (
        <div role="alert">
          <p>Assignments could not be loaded.</p>
          <button type="button" onClick={onRetryLoad}>
            Try Again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <p>No tasks available. Add your first task!</p>
      ) : sortedTasks.length === 0 ? (
        <p>No matching tasks found.</p>
      ) : (
        sortedTasks.map((task) => (
          <div className="task-card" key={task._id}>
            <h3 className={task.completed ? "completed" : ""}>
              {task.title}
            </h3>

            <p>Subject: {task.subject}</p>

            <p>
              Category:{" "}
              <span className="category-badge">
                {task.category || "Homework"}
              </span>
            </p>

            {task.description && (
              <div className="description-container">
                <p
                  className={`task-description ${
                    expandedDescriptions[task._id] ? "expanded" : ""
                  }`}
                >
                  <strong>Description:</strong> {task.description}
                </p>

                {task.description.length > 120 && (
                  <button
                    type="button"
                    className="read-more-btn"
                    onClick={() => toggleDescription(task._id)}
                  >
                    {expandedDescriptions[task._id]
                      ? "Show Less ↑"
                      : "Read More ↓"}
                  </button>
                )}
              </div>
            )}

            <p>
              Due date: {new Date(task.dueDate).toLocaleDateString()}
            </p>

            <p>
              Priority:{" "}
              <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </p>

            <p>
              Status:{" "}
              <span
                className={`status-badge ${
                  task.completed ? "completed-status" : "pending-status"
                }`}
              >
                {task.completed ? "Completed" : "Pending"}
              </span>
            </p>

            {isOverdue(task) && (
              <p>
                <span className="overdue-badge">⚠ Overdue</span>
              </p>
            )}

            <div className="task-actions">
              <button type="button" onClick={() => setSelectedTask(task)}>
                View Details
              </button>

              <button
                type="button"
                disabled={Boolean(activeTaskActionId)}
                onClick={() => toggleComplete(task._id)}
              >
                {task.completed ? "Mark Pending" : "Mark Completed"}
              </button>

              <button
                type="button"
                disabled={Boolean(activeTaskActionId)}
                onClick={() => editTask(task)}
              >
                Edit
              </button>

              <button
                type="button"
                className="delete-btn"
                disabled={Boolean(activeTaskActionId)}
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this assignment?"
                  );

                  if (confirmDelete) deleteTask(task._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* Task Details Popup */}
      {selectedTask && (
        <div className="task-modal-overlay" onClick={closeDetails}>
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeDetails}
              aria-label="Close details"
            >
              ×
            </button>

            <h2 id="task-modal-title">Assignment Details</h2>
            <h3>{selectedTask.title}</h3>

            <div className="modal-detail description-detail">
              <strong>Description:</strong>
              <span>
                {selectedTask.description || "No description added"}
              </span>
            </div>

            <div className="modal-detail">
              <strong>Subject:</strong>
              <span>{selectedTask.subject}</span>
            </div>

            <div className="modal-detail">
              <strong>Category:</strong>
              <span className="category-badge">
                {selectedTask.category || "Homework"}
              </span>
            </div>

            <div className="modal-detail">
              <strong>Due Date:</strong>
              <span>
                {new Date(selectedTask.dueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="modal-detail">
              <strong>Priority:</strong>
              <span>{selectedTask.priority}</span>
            </div>

            <div className="modal-detail">
              <strong>Status:</strong>
              <span>
                {selectedTask.completed ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="modal-detail">
              <strong>Deadline Status:</strong>
              <span>
                {selectedTask.completed
                  ? "Completed"
                  : isOverdue(selectedTask)
                  ? "Overdue"
                  : "Upcoming"}
              </span>
            </div>

            <button
              type="button"
              className="modal-done-btn"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default TaskList;

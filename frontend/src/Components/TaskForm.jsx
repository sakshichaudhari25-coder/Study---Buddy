function TaskForm({
  title,
  setTitle,
  subject,
  setSubject,
  description,
  setDescription,
  category,
  setCategory,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  handleSubmit,
  editingTaskId,
  resetForm,
}) {
  return (
    <section className="task-section">
      <h2>{editingTaskId ? "Edit Task" : "Add a New Task"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Assignment Title */}
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        {/* Description */}
        <textarea
          placeholder="Assignment description or instructions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        />

        {/* Assignment Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
          <option value="Exam">Exam</option>
          <option value="Practical">Practical</option>
          <option value="Presentation">Presentation</option>
        </select>

        {/* Due Date */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        {/* Submit */}
        <button type="submit">
          {editingTaskId ? "Save Changes" : "Add Task"}
        </button>

        {/* Cancel */}
        {editingTaskId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

export default TaskForm;

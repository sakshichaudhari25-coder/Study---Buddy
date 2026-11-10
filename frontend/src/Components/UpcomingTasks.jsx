
function UpcomingTasks({ tasks }) {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Convert date string into local date
  function getDateOnly(dateValue) {
    const [year, month, day] = String(dateValue)
      .slice(0, 10)
      .split("-")
      .map(Number);

    return new Date(year, month - 1, day);
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Separate assignments by deadline
  const pendingTasks = tasks.filter((task) => !task.completed);

  const overdueTasks = pendingTasks
    .filter((task) => getDateOnly(task.dueDate) < today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const todayTasks = pendingTasks.filter(
    (task) => getDateOnly(task.dueDate).getTime() === today.getTime()
  );

  const tomorrowTasks = pendingTasks.filter(
    (task) => getDateOnly(task.dueDate).getTime() === tomorrow.getTime()
  );

  const upcomingTasks = pendingTasks
    .filter((task) => {
      const dueDate = getDateOnly(task.dueDate);

      return dueDate > tomorrow && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Reusable assignment card
  function renderTasks(taskList, emptyMessage) {
    if (taskList.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return taskList.map((task) => (
      <div className="task-card" key={task._id}>
        <h3>{task.title}</h3>

        <p>Subject: {task.subject}</p>

        <p>
          Category:{" "}
          <span className="category-badge">
            {task.category || "Homework"}
          </span>
        </p>

        <p>
          Due Date: {getDateOnly(task.dueDate).toLocaleDateString()}
        </p>

        <p>Priority: {task.priority}</p>
      </div>
    ));
  }

  return (
    <section className="task-section" id="upcoming">
      <h2>📅 Upcoming Deadlines</h2>

      <p className="analytics-subtitle">
        Stay organized and never miss an assignment deadline.
      </p>

      {/* Deadline Summary */}
      <div className="analytics-summary">
        <div className="analytics-card">
          <h3>{overdueTasks.length}</h3>
          <p>Overdue</p>
        </div>

        <div className="analytics-card">
          <h3>{todayTasks.length}</h3>
          <p>Due Today</p>
        </div>

        <div className="analytics-card">
          <h3>{tomorrowTasks.length}</h3>
          <p>Due Tomorrow</p>
        </div>

        <div className="analytics-card">
          <h3>{upcomingTasks.length}</h3>
          <p>Next 7 Days</p>
        </div>
      </div>

      {/* Overdue Assignments */}
      <div>
        <h3>⚠️ Overdue Assignments</h3>
        {renderTasks(overdueTasks, "No overdue assignments!")}
      </div>

      {/* Today's Assignments */}
      <div>
        <h3>📌 Due Today</h3>
        {renderTasks(todayTasks, "No assignments due today.")}
      </div>

      {/* Tomorrow's Assignments */}
      <div>
        <h3>⏰ Due Tomorrow</h3>
        {renderTasks(tomorrowTasks, "No assignments due tomorrow.")}
      </div>

      {/* Next 7 Days */}
      <div>
        <h3>🗓️ Due Within 7 Days</h3>
        {renderTasks(upcomingTasks, "No other upcoming deadlines.")}
      </div>
    </section>
  );
}

export default UpcomingTasks;

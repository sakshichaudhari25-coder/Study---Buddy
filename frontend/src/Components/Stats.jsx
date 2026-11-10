
function Stats({ tasks }) {
  const total = tasks.length;

  const pending = tasks.filter(
    (task) => !task.completed
  ).length;

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const overdue = tasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return !task.completed && dueDate < today;
  }).length;

  const progress = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  return (
    <section className="stats">

      <div className="stat-card">
        <h3>Total Tasks</h3>
        <p>{total}</p>
      </div>

      <div className="stat-card">
        <h3>Pending</h3>
        <p>{pending}</p>
      </div>

      <div className="stat-card">
        <h3>Completed</h3>
        <p>{completed}</p>
      </div>

      <div className="stat-card">
        <h3>Overdue</h3>
        <p>{overdue}</p>
      </div>

      <div className="stat-card">
        <h3>Completion Progress</h3>
        <p>{progress}%</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

    </section>
  );
}

export default Stats;

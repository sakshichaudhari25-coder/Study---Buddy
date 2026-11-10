
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Analytics({ tasks }) {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  const completionPercentage =
    tasks.length === 0
      ? 0
      : Math.round((completed / tasks.length) * 100);

  // Completed vs Pending
  const statusData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  // Tasks by Priority
  const priorityData = [
    {
      name: "High",
      tasks: tasks.filter((task) => task.priority === "High").length,
    },
    {
      name: "Medium",
      tasks: tasks.filter((task) => task.priority === "Medium").length,
    },
    {
      name: "Low",
      tasks: tasks.filter((task) => task.priority === "Low").length,
    },
  ];

  // Tasks by Category
  const categories = [
    "Homework",
    "Project",
    "Exam",
    "Practical",
    "Presentation",
  ];

  const categoryData = categories.map((category) => ({
    name: category,
    tasks: tasks.filter(
      (task) => (task.category || "Homework") === category
    ).length,
  }));

  const COLORS = ["#22c55e", "#f59e0b"];

  return (
    <section className="analytics-section" id="analytics">
      <h2>📊 Task Analytics</h2>

      <p className="analytics-subtitle">
        Track your productivity and assignment progress.
      </p>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="analytics-card">
          <h3>{tasks.length}</h3>
          <p>Total Assignments</p>
        </div>

        <div className="analytics-card">
          <h3>{completed}</h3>
          <p>Completed</p>
        </div>

        <div className="analytics-card">
          <h3>{pending}</h3>
          <p>Pending</p>
        </div>

        <div className="analytics-card">
          <h3>{completionPercentage}%</h3>
          <p>Completion Rate</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="analytics-charts">

        {/* Completion Chart */}
        <div className="chart-card">
          <h3>Completed vs Pending</h3>

          {tasks.length === 0 ? (
            <p>Add assignments to see your chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Chart */}
        <div className="chart-card">
          <h3>Assignments by Priority</h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="tasks"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="chart-card">
          <h3>Assignments by Category</h3>

          {tasks.length === 0 ? (
            <p>Add assignments to see category statistics.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="tasks"
                  fill="#14b8a6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </section>
  );
}

export default Analytics;

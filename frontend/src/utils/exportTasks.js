
function exportTasks(tasks) {
  if (tasks.length === 0) {
    return false;
  }

  const headers = [
    "Title",
    "Subject",
    "Due Date",
    "Priority",
    "Status",
  ];

  const rows = tasks.map((task) => [
    task.title,
    task.subject,
    new Date(task.dueDate).toLocaleDateString(),
    task.priority,
    task.completed ? "Completed" : "Pending",
  ]);

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "StudyBuddy-Assignments.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}

export default exportTasks;

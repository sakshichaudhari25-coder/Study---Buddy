
import { useState } from "react";

function CalendarView({ tasks }) {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function getDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  // Get tasks for a particular date
  function getTasksForDate(date) {
    const dateKey = getDateKey(date);

    return tasks.filter(
      (task) => String(task.dueDate).slice(0, 10) === dateKey
    );
  }

  // Check overdue assignments
  function isOverdue(task) {
    return (
      !task.completed &&
      String(task.dueDate).slice(0, 10) < getDateKey(today)
    );
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    const current = new Date();
    setCurrentDate(current);
    setSelectedDate(current);
  }

  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <section className="calendar-section" id="calendar">
      <h2>Assignment Calendar</h2>

      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          type="button"
          onClick={previousMonth}
          aria-label="Previous month"
        >
          ←
        </button>

        <h3>
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button type="button" onClick={nextMonth} aria-label="Next month">
          →
        </button>
      </div>

      <button
        type="button"
        className="today-button"
        onClick={goToToday}
      >
        Today
      </button>

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <span><i className="legend-today" /> Today</span>
        <span><i className="legend-pending" /> Pending</span>
        <span><i className="legend-completed" /> Completed</span>
        <span><i className="legend-overdue" /> Overdue</span>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div className="calendar-weekday" key={day}>
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, index) => (
          <div className="calendar-empty" key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const dateTasks = getTasksForDate(date);

          const dateKey = getDateKey(date);

          const isToday = dateKey === getDateKey(today);
          const isSelected = dateKey === getDateKey(selectedDate);

          const hasOverdue = dateTasks.some(isOverdue);

          const hasPending = dateTasks.some(
            (task) => !task.completed && !isOverdue(task)
          );

          const hasCompleted = dateTasks.some(
            (task) => task.completed
          );

          return (
            <button
              type="button"
              key={day}
              className={`calendar-day
                ${isToday ? "today-day" : ""}
                ${isSelected ? "selected-day" : ""}
              `}
              onClick={() => setSelectedDate(date)}
            >
              <span>{day}</span>

              <div className="calendar-indicators">
                {hasPending && <i className="pending-dot" />}
                {hasCompleted && <i className="completed-dot" />}
                {hasOverdue && <i className="overdue-dot" />}
              </div>

              {dateTasks.length > 0 && (
                <span className="calendar-task-count">
                  {dateTasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Assignments */}
      <div className="selected-date-tasks">
        <h3>
          Tasks for{" "}
          {selectedDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>

        {selectedTasks.length === 0 ? (
          <p>No assignments due on this date.</p>
        ) : (
          selectedTasks.map((task) => (
            <div className="calendar-task" key={task._id}>
              <strong>{task.title}</strong>

              <p>Subject: {task.subject}</p>

              {/* Category Badge */}
              <p>
                Category:{" "}
                <span className="category-badge">
                  {task.category || "Homework"}
                </span>
              </p>

              <p>Priority: {task.priority}</p>

              {/* Assignment Status */}
              <span
                className={
                  task.completed
                    ? "calendar-status completed"
                    : isOverdue(task)
                    ? "calendar-status overdue"
                    : "calendar-status pending"
                }
              >
                {task.completed
                  ? "Completed"
                  : isOverdue(task)
                  ? "Overdue"
                  : "Pending"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CalendarView;

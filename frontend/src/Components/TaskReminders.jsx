
import { useEffect, useState } from "react";

function TaskReminders({ tasks }) {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  // Convert date into YYYY-MM-DD format
  function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Check tasks due today or tomorrow
  function checkReminders() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayKey = getDateKey(today);
    const tomorrowKey = getDateKey(tomorrow);

    tasks.forEach((task) => {
      if (task.completed) return;

      const dueDateKey = task.dueDate.split("T")[0];

      if (dueDateKey !== todayKey && dueDateKey !== tomorrowKey) {
        return;
      }

      const reminderKey = `studybuddy-reminder-${task._id}-${dueDateKey}`;

      // Avoid showing the same reminder repeatedly
      if (localStorage.getItem(reminderKey)) return;

      const message =
        dueDateKey === todayKey
          ? "This assignment is due today!"
          : "This assignment is due tomorrow!";

      new Notification(task.title, {
        body: `${message} Subject: ${task.subject}`,
        icon: "/vite.svg",
      });

      localStorage.setItem(reminderKey, "shown");
    });
  }

  // Ask browser permission
  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();

    setPermission(result);

    if (result === "granted") {
      alert("Notifications enabled successfully!");
      checkReminders();
    } else {
      alert("Notification permission was not granted.");
    }
  }

  // Check reminders when tasks change and every minute
  useEffect(() => {
    if (permission !== "granted") return;

    checkReminders();

    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [tasks, permission]);

  return (
    <section className="reminder-section">
      <div>
        <h2>🔔 Deadline Reminders</h2>
        <p>
          Get browser notifications for assignments due today or tomorrow.
        </p>
      </div>

      {permission === "granted" ? (
        <span className="reminder-enabled">
          ✓ Notifications Enabled
        </span>
      ) : permission === "denied" ? (
        <p>Notifications are blocked. Allow them in your browser settings.</p>
      ) : (
        <button type="button" onClick={enableNotifications}>
          Enable Notifications
        </button>
      )}
    </section>
  );
}

export default TaskReminders;

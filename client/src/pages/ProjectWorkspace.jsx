import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  User,
  UserPlus,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function ProjectWorkspace() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
  });

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // -----------------------------
  // Fetch Project
  // -----------------------------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("You are not logged in.");
        }

        const response = await fetch(
          `${API_URL}/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load project"
          );
        }

        setProject(data.project);
      } catch (err) {
        console.error("Project workspace error:", err);

        setError(
          err.message || "Failed to load project workspace"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // -----------------------------
  // Fetch Tasks
  // -----------------------------
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      setTaskError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_URL}/api/tasks/project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load tasks"
        );
      }

      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Tasks error:", err);

      setTaskError(
        err.message || "Failed to load project tasks"
      );
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTasks();
    }
  }, [id]);

  // -----------------------------
  // Create Task
  // -----------------------------
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      return;
    }

    try {
      setCreatingTask(true);
      setTaskError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(id),
          title: taskForm.title.trim(),
          description:
            taskForm.description.trim() || undefined,
          assigneeId: taskForm.assigneeId
            ? Number(taskForm.assigneeId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create task"
        );
      }

      setTasks((prev) => [data.task, ...prev]);

      setTaskForm({
        title: "",
        description: "",
        assigneeId: "",
      });

      setShowCreateTask(false);
    } catch (err) {
      console.error("Create task error:", err);

      setTaskError(
        err.message || "Failed to create task"
      );
    } finally {
      setCreatingTask(false);
    }
  };

  // -----------------------------
  // Update Task Status
  // -----------------------------
  const handleStatusChange = async (taskId, status) => {
    try {
      setTaskError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update task status"
        );
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? data.task : task
        )
      );
    } catch (err) {
      console.error("Update task status error:", err);

      setTaskError(
        err.message || "Failed to update task status"
      );
    }
  };

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Loading project workspace...
        </p>
      </div>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------
  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const members = project.members || [];
  const roles = project.roles || [];

  const memberCount = members.length;
  const teamSize = project.teamSize;

  const teamProgress = Math.min(
    Math.round((memberCount / teamSize) * 100),
    100
  );

  const isCreator =
    project.creatorId === currentUser?.id;

  /*
   * Count how many members are assigned to each required role.
   */
  const roleStatus = roles.map((requiredRole) => {
    const filledCount = members.filter(
      (member) =>
        member.role === requiredRole.role &&
        member.status === "active"
    ).length;

    return {
      ...requiredRole,
      filledCount,
      isFilled: filledCount > 0,
    };
  });

  const todoCount = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const doneCount = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        to="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              Project Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {project.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description}
            </p>
          </div>

          {isCreator && (
            <Link
              to={`/dashboard/team-finder?project=${project.id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Find Teammates
            </Link>
          )}
        </div>

        {/* Project Information */}
        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Team
              </p>

              <p className="font-medium">
                {memberCount} / {teamSize} members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Clock className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Duration
              </p>

              <p className="font-medium">
                {project.duration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Created
              </p>

              <p className="font-medium">
                {new Date(
                  project.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Team Progress */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Team Progress
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {memberCount >= teamSize
                  ? "Your team is complete."
                  : `${teamSize - memberCount} ${
                      teamSize - memberCount === 1
                        ? "member"
                        : "members"
                    } still needed.`}
              </p>
            </div>

            <span className="text-sm font-semibold">
              {teamProgress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${teamProgress}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section>
        <div>
          <h2 className="text-lg font-semibold">
            Team Members
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Students currently working on this project.
          </p>
        </div>

        {members.length === 0 ? (
          <div className="mt-4 rounded-xl border bg-card p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No team members yet
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {members.map((member) => {
              const memberName =
                member.user?.name || "Unknown Student";

              const initials = memberName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const isCurrentUser =
                member.userId === currentUser?.id;

              return (
                <div
                  key={member.id}
                  className="rounded-xl border bg-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {memberName}
                        </h3>

                        {isCurrentUser && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                            You
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-primary">
                        {member.role}
                      </p>

                      {member.user?.profile && (
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {member.user.profile.college && (
                            <p>
                              {member.user.profile.college}
                            </p>
                          )}

                          {member.user.profile.course && (
                            <p>
                              {member.user.profile.course}
                              {member.user.profile.year
                                ? ` • Year ${member.user.profile.year}`
                                : ""}
                            </p>
                          )}

                          {member.user.profile.skills && (
                            <p className="line-clamp-2">
                              Skills:{" "}
                              {member.user.profile.skills}
                            </p>
                          )}
                        </div>
                      )}

                      {!isCurrentUser && (
                        <Link
                          to={`/dashboard/students/${member.userId}`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <User className="h-3.5 w-3.5" />
                          View Profile
                        </Link>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                      {member.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Required Roles */}
      <section>
        <div>
          <h2 className="text-lg font-semibold">
            Required Roles
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Roles defined for this project and their current
            status.
          </p>
        </div>

        <div className="mt-4 rounded-xl border bg-card">
          {roleStatus.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No roles defined for this project.
            </div>
          ) : (
            <div className="divide-y">
              {roleStatus.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        role.isFilled
                          ? "bg-secondary text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {role.isFilled ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <UserPlus className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium">
                        {role.role}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {role.filledCount > 0
                          ? `${role.filledCount} member assigned`
                          : "No member assigned yet"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      role.isFilled
                        ? "bg-secondary text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {role.isFilled ? "Filled" : "Open"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tasks */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Tasks
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Track the work that needs to be completed for this
              project.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowCreateTask((prev) => !prev)
            }
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {showCreateTask ? "Cancel" : "Create Task"}
          </button>
        </div>

        {/* Task Summary */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              To Do
            </p>

            <p className="mt-1 text-2xl font-bold">
              {todoCount}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              In Progress
            </p>

            <p className="mt-1 text-2xl font-bold">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold">
              {doneCount}
            </p>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreateTask && (
          <form
            onSubmit={handleCreateTask}
            className="mt-4 rounded-xl border bg-card p-5"
          >
            <h3 className="font-semibold">
              Create New Task
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Task Title
                </label>

                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Build login page"
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what needs to be done..."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Assign To
                </label>

                <select
                  value={taskForm.assigneeId}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      assigneeId: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members
                    .filter(
                      (member) =>
                        member.status === "active"
                    )
                    .map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.user?.name || "Unknown Student"}{" "}
                        — {member.role}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  creatingTask || !taskForm.title.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />

                {creatingTask
                  ? "Creating..."
                  : "Create Task"}
              </button>
            </div>
          </form>
        )}

        {/* Task Error */}
        {taskError && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {taskError}
          </div>
        )}

        {/* Task List */}
        {tasksLoading ? (
          <div className="mt-4 rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-4 rounded-xl border bg-card p-8 text-center">
            <ListTodo className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No tasks yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create the first task for this project.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border bg-card p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          task.status === "DONE"
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                        {task.status === "IN_PROGRESS"
                          ? "In Progress"
                          : task.status === "DONE"
                            ? "Done"
                            : "To Do"}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {task.assignee?.user ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />

                          Assigned to{" "}
                          <span className="font-medium text-foreground">
                            {task.assignee.user.name}
                          </span>
                        </span>
                      ) : (
                        <span>
                          Unassigned
                        </span>
                      )}

                      <span>
                        Created{" "}
                        {new Date(
                          task.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(
                          task.id,
                          e.target.value
                        )
                      }
                      className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="TODO">
                        To Do
                      </option>

                      <option value="IN_PROGRESS">
                        In Progress
                      </option>

                      <option value="DONE">
                        Done
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workspace Status */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              Workspace ready
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your team workspace is now the central place to
              understand who is working on the project, which
              roles are still open, and what work needs to be
              completed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectWorkspace;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Users,
  UserRound,
  UserRoundPlus,
  Clock,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [error, setError] = useState("");
  const [tasksError, setTasksError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }

    fetchDashboardData();
    fetchMyTasks();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const [projectsResponse, profileResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/projects`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/api/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const projectsData = await projectsResponse.json();
      const profileData = await profileResponse.json();

      if (!projectsResponse.ok) {
        throw new Error(
          projectsData.message || "Failed to load projects"
        );
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Failed to load profile"
        );
      }

      setProjects(projectsData.projects || []);
      setProfile(profileData.profile || null);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_URL}/api/tasks/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load your tasks"
        );
      }

      setMyTasks(data.tasks || []);
    } catch (error) {
      console.error("My tasks error:", error);
      setTasksError(
        error.message || "Failed to load your tasks"
      );
    } finally {
      setTasksLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profile) {
      return 0;
    }

    const fields = [
      profile.bio,
      profile.college,
      profile.course,
      profile.year,
      profile.skills,
      profile.interests,
      profile.availability,
      profile.experience,
    ];

    const completed = fields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
    ).length;

    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const totalTeamMembers = projects.reduce(
    (total, project) => {
      return total + (project.members?.length || 0);
    },
    0
  );

  const taskCounts = {
    total: myTasks.length,
    todo: myTasks.filter(
      (task) => task.status === "TODO"
    ).length,
    inProgress: myTasks.filter(
      (task) => task.status === "IN_PROGRESS"
    ).length,
    done: myTasks.filter(
      (task) => task.status === "DONE"
    ).length,
  };

  const getUserName = () => {
    if (user?.name) {
      return user.name;
    }

    return "Student";
  };

  const getStatusLabel = (status) => {
    if (status === "IN_PROGRESS") {
      return "In Progress";
    }

    if (status === "DONE") {
      return "Done";
    }

    return "To Do";
  };

  const getStatusClass = (status) => {
    if (status === "DONE") {
      return "bg-green-100 text-green-700";
    }

    if (status === "IN_PROGRESS") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-secondary text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-10 w-96 animate-pulse rounded bg-muted" />
          <div className="h-6 w-[500px] max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-xl border bg-card"
            />
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-primary">
            Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h1>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />

            <div>
              <h2 className="font-semibold text-destructive">
                Could not load dashboard
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  fetchDashboardData();
                  fetchMyTasks();
                }}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section>
        <p className="text-sm font-medium text-primary">
          Dashboard
        </p>

        <h1 className="mt-1 text-4xl font-bold tracking-tight">
          Welcome back, {getUserName()} 👋
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">
          Discover people, build projects, and collaborate on campus.
        </p>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}
      <section className="grid gap-5 md:grid-cols-3">
        {/* My Projects */}
        <Link
          to="/dashboard/projects"
          className="group rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <FolderKanban className="h-7 w-7" />
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>

          <div className="mt-7">
            <p className="text-base text-muted-foreground">
              My Projects
            </p>

            <p className="mt-2 text-4xl font-bold">
              {projects.length}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Projects you created
            </p>
          </div>
        </Link>

        {/* Team Members */}
        <div className="rounded-xl border bg-card p-7 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <Users className="h-7 w-7" />
            </div>

            <Users className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-7">
            <p className="text-base text-muted-foreground">
              Team Members
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalTeamMembers}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Across your projects
            </p>
          </div>
        </div>

        {/* Profile Completion */}
        <Link
          to="/dashboard/profile"
          className="group rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <UserRound className="h-7 w-7" />
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>

          <div className="mt-7">
            <p className="text-base text-muted-foreground">
              Profile Completion
            </p>

            <p className="mt-2 text-4xl font-bold">
              {profileCompletion}%
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>
          </div>
        </Link>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}
      <section>
        <h2 className="text-2xl font-semibold">
          What do you want to do?
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {/* Find Teammates */}
          <Link
            to="/dashboard/team-finder"
            className="group rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <UserRoundPlus className="h-7 w-7" />
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Find Teammates
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Find students with the skills your project needs.
                </p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          {/* Explore Projects */}
          <Link
            to="/dashboard/projects"
            className="group rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <FolderKanban className="h-7 w-7" />
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Explore Projects
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create projects, build teams, and collaborate.
                </p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          {/* Find Opportunities */}
          <Link
            to="/opportunities"
            className="group rounded-xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Find Opportunities
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Discover hackathons, workshops, events, and more.
                </p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        </div>
      </section>

      {/* =====================================================
          MY TASKS
      ====================================================== */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />

              <h2 className="text-2xl font-semibold">
                My Tasks
              </h2>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Tasks assigned to you across your projects.
            </p>
          </div>

          {myTasks.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-secondary px-3 py-1.5">
                {taskCounts.todo} To Do
              </span>

              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-700">
                {taskCounts.inProgress} In Progress
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1.5 text-green-700">
                {taskCounts.done} Done
              </span>
            </div>
          )}
        </div>

        {/* Task Loading */}
        {tasksLoading && (
          <div className="mt-5 rounded-xl border bg-card p-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 animate-pulse text-muted-foreground" />

            <p className="mt-3 text-sm text-muted-foreground">
              Loading your tasks...
            </p>
          </div>
        )}

        {/* Task Error */}
        {!tasksLoading && tasksError && (
          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />

              <div>
                <h3 className="font-semibold text-destructive">
                  Could not load your tasks
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {tasksError}
                </p>

                <button
                  type="button"
                  onClick={fetchMyTasks}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Tasks */}
        {!tasksLoading &&
          !tasksError &&
          myTasks.length === 0 && (
            <div className="mt-5 rounded-xl border bg-card p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <ClipboardList className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No tasks assigned to you
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Tasks assigned to you by your project teammates will
                appear here.
              </p>
            </div>
          )}

        {/* Tasks */}
        {!tasksLoading &&
          !tasksError &&
          myTasks.length > 0 && (
            <div className="mt-5 space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Task information */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                          <ClipboardList className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {task.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-primary">
                            {task.project?.name || "Project"}
                          </p>
                        </div>
                      </div>

                      {task.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Assigned task
                        </span>

                        {task.assignee?.role && (
                          <span>
                            Role: {task.assignee.role}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status + project */}
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>

                      <Link
                        to={`/dashboard/projects/${task.project?.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                      >
                        Open Project
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      {/* =====================================================
          MY PROJECTS
      ====================================================== */}
      {projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Your Projects
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Projects you have created.
              </p>
            </div>

            <Link
              to="/dashboard/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                to={`/dashboard/projects/${project.id}`}
                className="group rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FolderKanban className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {project.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                    {project.teamSize} team members
                  </span>

                  <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                    {project.duration}
                  </span>

                  {project.roles?.length > 0 && (
                    <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                      {project.roles.length} roles
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          PROFILE COMPLETION CTA
      ====================================================== */}
      {profileCompletion < 100 && (
        <section className="rounded-xl border border-primary/10 bg-secondary/40 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />

                <h2 className="font-semibold">
                  Complete your profile
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                A complete profile helps teammates understand your
                skills and helps Team Finder recommend you for the
                right projects.
              </p>
            </div>

            <Link
              to="/dashboard/profile"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Complete Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* =====================================================
          COMPLETED PROFILE
      ====================================================== */}
      {profileCompletion === 100 && (
        <section className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

            <div>
              <h2 className="font-semibold text-green-800">
                Your profile is complete
              </h2>

              <p className="mt-1 text-sm text-green-700">
                Your profile has all the information needed for
                better collaboration and Team Finder recommendations.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
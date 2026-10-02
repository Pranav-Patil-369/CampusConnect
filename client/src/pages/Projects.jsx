import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  Users,
  Target,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Get projects error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <FolderKanban className="h-4 w-4" />
            Projects
          </div>

          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create projects, build teams, and find students with the skills
            your project needs.
          </p>
        </div>

        <Link
          to="/dashboard/projects/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border border-border bg-white"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />

            <div>
              <h2 className="font-semibold text-destructive">
                Could not load projects
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">{error}</p>

              <button
                type="button"
                onClick={fetchProjects}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <FolderKanban className="h-7 w-7 text-primary" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            You haven't created a project yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Start a project, define the roles you need, and use Team Finder to
            discover students who can help build it.
          </p>

          <Link
            to="/dashboard/projects/create"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Your First Project
          </Link>
        </div>
      )}

      {/* Projects */}
      {!loading && !error && projects.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"} created
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  const memberCount = project.members?.length || 0;
  const roleCount = project.roles?.length || 0;

  return (
    <div className="group rounded-xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <FolderKanban className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">
              {project.name}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {project.duration}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Active
        </span>
      </div>

      {/* Description */}
      <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Team
          </div>

          <p className="mt-1 text-sm font-semibold">
            {memberCount} / {project.teamSize} members
          </p>
        </div>

        <div className="rounded-lg bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="h-4 w-4" />
            Roles
          </div>

          <p className="mt-1 text-sm font-semibold">
            {roleCount} required
          </p>
        </div>
      </div>

      {/* Roles */}
      {project.roles?.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Project needs
          </p>

          <div className="flex flex-wrap gap-2">
            {project.roles.slice(0, 5).map((projectRole) => (
              <span
                key={projectRole.id}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary"
              >
                {projectRole.role}
              </span>
            ))}

            {project.roles.length > 5 && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{project.roles.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(project.createdAt).toLocaleDateString()}
        </span>

        <Link
          to={`/dashboard/team-finder?project=${project.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
        >
          Find Teammates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default Projects;
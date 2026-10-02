import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderPlus,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const availableRoles = [
  "AI/ML Developer",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Database Developer",
  "Mobile Developer",
  "DevOps / Cloud",
  "Research / Domain Expert",
];

function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teamSize: "4",
    duration: "4 weeks",
    roles: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleRole = (role) => {
    setFormData((previous) => {
      const alreadySelected = previous.roles.includes(role);

      return {
        ...previous,
        roles: alreadySelected
          ? previous.roles.filter((item) => item !== role)
          : [...previous.roles, role],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.roles.length === 0) {
      setError("Please select at least one required role.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          teamSize: Number(formData.teamSize),
          duration: formData.duration,
          roles: formData.roles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      setSuccess("Project created successfully!");

      setTimeout(() => {
        navigate("/dashboard/projects");
      }, 800);
    } catch (err) {
      console.error("Create project error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/projects")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <FolderPlus className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create a New Project
            </h1>

            <p className="mt-2 text-muted-foreground">
              Tell students what you're building and what kind of teammates
              your project needs.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="space-y-7">
          {/* Project name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold"
            >
              Project Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. AI Study Assistant"
              required
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold"
            >
              Project Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain what you want to build, the problem it solves, and what your project is about."
              required
              maxLength={2000}
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Team size + Duration */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="teamSize"
                className="mb-2 flex items-center gap-2 text-sm font-semibold"
              >
                <Users className="h-4 w-4 text-primary" />
                Team Size
              </label>

              <select
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                  <option key={size} value={size}>
                    {size} members
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-2 flex items-center gap-2 text-sm font-semibold"
              >
                <Clock className="h-4 w-4 text-primary" />
                Project Duration
              </label>

              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="4 weeks">4 weeks</option>
                <option value="6 weeks">6 weeks</option>
                <option value="8 weeks">8 weeks</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
              </select>
            </div>
          </div>

          {/* Roles */}
          <div>
            <div className="mb-3">
              <h2 className="text-sm font-semibold">
                What roles does your project need?
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Select the roles required to build your project. A student can
                eventually fill more than one role.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {availableRoles.map((role) => {
                const selected = formData.roles.includes(role);

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-primary bg-secondary"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {selected && <CheckCircle2 className="h-4 w-4" />}
                    </div>

                    <span className="text-sm font-medium">{role}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Selected roles:{" "}
              <span className="font-semibold text-foreground">
                {formData.roles.length}
              </span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end border-t border-border pt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Project..." : "Create Project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;
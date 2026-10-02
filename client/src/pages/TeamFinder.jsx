import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Target,
  UserPlus,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function TeamFinder() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");

  const [project, setProject] = useState(null);
  const [missingRoles, setMissingRoles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      if (!projectId) {
        throw new Error("No project selected.");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_URL}/api/team-finder?projectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load team recommendations"
        );
      }

      setProject(data.project || null);
      setMissingRoles(data.missingRoles || []);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Team Finder error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="rounded-xl border border-border bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Target className="h-7 w-7 text-primary" />
        </div>

        <h1 className="mt-4 text-xl font-semibold">
          Select a project first
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Team Finder needs to know which project you are building so it can
          find students who fill the project's missing roles.
        </p>

        <Link
          to="/dashboard/projects"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go to Projects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Projects
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Project-based Team Finder
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Find Your Teammates
            </h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Find students who can fill the roles your project currently
              needs.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-5">
          <div className="h-40 animate-pulse rounded-xl border border-border bg-white" />

          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-xl border border-border bg-white"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />

            <div>
              <h2 className="font-semibold text-destructive">
                Could not load Team Finder
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchRecommendations}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project information */}
      {!loading && !error && project && (
        <>
          <div className="rounded-xl border border-primary/10 bg-secondary/50 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Target className="h-4 w-4" />
                  Matching for project
                </div>

                <h2 className="text-xl font-bold">{project.name}</h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Team size
                  </p>
                  <p className="mt-1 font-semibold">
                    {project.teamSize} members
                  </p>
                </div>

                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Duration
                  </p>
                  <p className="mt-1 font-semibold">
                    {project.duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Missing roles */}
          <div className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">Roles still needed</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Team Finder is looking for students who can fill these
                  project requirements.
                </p>
              </div>

              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary">
                {missingRoles.length} needed
              </span>
            </div>

            {missingRoles.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {missingRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <Target className="h-3.5 w-3.5" />
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                All required roles are currently filled.
              </div>
            )}
          </div>

          {/* No recommendations */}
          {recommendations.length === 0 && missingRoles.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Users className="h-7 w-7 text-primary" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                No matching students found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We couldn't find students whose current profiles match the
                project's missing roles. More complete student profiles will
                improve recommendations.
              </p>

              <Link
                to="/dashboard/discover"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Browse Students
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Recommended Teammates
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  These students are ranked based on how well their profiles
                  can fill the project's missing roles.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {recommendations.map((student) => (
                  <RecommendationCard
                    key={student.id}
                    student={student}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({ student }) {
  const profile = student.profile || {};

  const skills = profile.skills
    ? profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group rounded-xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Student header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
            {student.name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {student.name}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 shrink-0" />
              {profile.course || "Student"}
              {profile.year ? ` · Year ${profile.year}` : ""}
            </p>
          </div>
        </div>

        {/* Match score */}
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold text-primary">
            {student.matchScore}%
          </div>

          <div className="text-xs text-muted-foreground">
            role match
          </div>
        </div>
      </div>

      {/* Recommended role */}
      <div className="mt-5 rounded-lg border border-primary/10 bg-secondary/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Recommended for
        </p>

        <div className="mt-1 flex items-center gap-2 font-semibold">
          <Target className="h-4 w-4 text-primary" />
          {student.recommendedRole}
        </div>
      </div>

      {/* Why this match */}
      {student.reasons?.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why this match?
          </p>

          <div className="space-y-2">
            {student.reasons.map((reason, index) => (
              <div
                key={`${reason}-${index}`}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 8).map((skill) => {
              const isMatching = student.matchingSkills?.some(
                (matchingSkill) =>
                  matchingSkill.toLowerCase() ===
                  skill.toLowerCase()
              );

              return (
                <span
                  key={skill}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isMatching
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Other profile information */}
      <div className="mt-5 space-y-3">
        {profile.college && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>{profile.college}</span>
          </div>
        )}

        {profile.availability && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{profile.availability}</span>
          </div>
        )}

        {profile.experience && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">
              {profile.experience}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <Link
          to={`/dashboard/students/${student.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
        >
          View Profile
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          disabled
          title="Invitation system will be added next"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground"
        >
          <UserPlus className="h-4 w-4" />
          Invite
        </button>
      </div>
    </div>
  );
}

export default TeamFinder;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Sparkles,
  Search,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function TeamFinder() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(`${API_URL}/api/team-finder`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load team recommendations"
        );
      }

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
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Smart Team Matching
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Find Your Teammates
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover students who match your skills, interests, availability,
            and experience.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-primary/10 bg-secondary/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">How Team Finder works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recommendations are currently based on four profile factors:
              skills, interests, availability, and experience.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1 font-medium">
                Skills · 50%
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-medium">
                Interests · 25%
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-medium">
                Availability · 15%
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-medium">
                Experience · 10%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
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
                Could not load Team Finder
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">{error}</p>

              <button
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

      {/* Empty */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Users className="h-7 w-7 text-primary" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No recommendations yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Complete your profile and add your skills, interests, availability,
            and experience to get better team recommendations.
          </p>

          <Link
            to="/dashboard/profile"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Recommendations */}
      {!loading && !error && recommendations.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Recommended Teammates
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ranked using your current profile information.
              </p>
            </div>

            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary">
              {recommendations.length} found
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {recommendations.map((student) => (
              <StudentRecommendation
                key={student.id}
                student={student}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentRecommendation({ student }) {
  const profile = student.profile || {};

  const skills = profile.skills
    ? profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const interests = profile.interests
    ? profile.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group rounded-xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
            {student.name?.charAt(0)?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">{student.name}</h3>

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
          <div className="text-xs text-muted-foreground">match</div>
        </div>
      </div>

      {/* Match reasons */}
      {student.reasons?.length > 0 && (
        <div className="mt-5 rounded-lg bg-muted/60 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why this match?
          </p>

          <div className="space-y-1.5">
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

      {/* Profile details */}
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
            <span className="line-clamp-2">{profile.experience}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill) => {
              const isMatch = student.matchingSkills?.some(
                (item) => item.toLowerCase() === skill.toLowerCase()
              );

              return (
                <span
                  key={skill}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isMatch
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

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interests
          </p>

          <div className="flex flex-wrap gap-2">
            {interests.slice(0, 6).map((interest) => {
              const isMatch = student.matchingInterests?.some(
                (item) => item.toLowerCase() === interest.toLowerCase()
              );

              return (
                <span
                  key={interest}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isMatch
                      ? "bg-secondary text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {interest}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* View profile */}
      <div className="mt-6 border-t border-border pt-4">
        <Link
          to={`/dashboard/students/${student.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
        >
          View Full Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default TeamFinder;
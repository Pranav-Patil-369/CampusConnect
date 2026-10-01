import { useEffect, useState } from "react";
import {
  Search,
  User,
  GraduationCap,
  Code2,
  Heart,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/discover/students";

function Discover() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const query = searchValue.trim()
        ? `?search=${encodeURIComponent(searchValue.trim())}`
        : "";

      const response = await fetch(`${API_URL}${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students");
      }

      setStudents(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchStudents(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchStudents("");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section>
        <p className="text-sm font-medium text-primary">Discover</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Discover Students
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find students with the skills, interests, and experience that match
          what you're building.
        </p>
      </section>

      {/* Search */}
      <section className="rounded-xl border bg-card p-5">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, skill, interest, or college..."
              className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="h-11 rounded-md border bg-background px-5 text-sm font-medium transition hover:bg-muted"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Students</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {students.length}{" "}
              {students.length === 1 ? "student" : "students"} found
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Finding students...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && students.length === 0 && (
        <section className="rounded-xl border bg-card p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">
            No students found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try searching for a different name, skill, interest, or college.
          </p>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Show All Students
            </button>
          )}
        </section>
      )}

      {/* Student Cards */}
      {!loading && !error && students.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </section>
      )}
    </div>
  );
}

function StudentCard({ student }) {
  const profile = student.profile;
  const navigate = useNavigate();

  const studentInitial = student.name?.charAt(0).toUpperCase() || "S";

  const skills = profile?.skills
    ? profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const interests = profile?.interests
    ? profile.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean)
    : [];

  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
      {/* Student Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {studentInitial}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold">{student.name}</h3>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 shrink-0" />

            <span className="truncate">
              {profile?.course || "Course not added"}
              {profile?.year ? ` • Year ${profile.year}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* College */}
      {profile?.college && (
        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{profile.college}</span>
        </div>
      )}

      {/* Bio */}
      {profile?.bio && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {profile.bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Code2 className="h-4 w-4 text-primary" />
            Skills
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-primary" />
            Interests
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t pt-4">
        <button
  type="button"
  onClick={() => navigate(`/dashboard/students/${student.id}`)}
  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
>
  <User className="h-4 w-4" />
  View Profile
</button>
      </div>
    </article>
  );
}

export default Discover;
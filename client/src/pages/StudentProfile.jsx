import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Code2,
  Heart,
  Clock3,
  BriefcaseBusiness,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/public-profile";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load student profile");
      }

      setStudent(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading student profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/discover")}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </button>

        <section className="rounded-xl border bg-card p-10 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />

          <h1 className="mt-4 text-lg font-semibold">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </section>
      </div>
    );
  }

  const profile = student?.profile;

  const studentInitial =
    student?.name?.charAt(0).toUpperCase() || "S";

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
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/discover")}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </button>

      {/* Profile Header */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {studentInitial}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {profile?.course && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {profile.course}
                </span>
              )}

              {profile?.year && (
                <span>Year {profile.year}</span>
              )}
            </div>

            {profile?.college && (
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.college}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bio */}
      {profile?.bio && (
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">About</h2>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            {profile.bio}
          </p>
        </section>
      )}

      {/* Skills & Interests */}
      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard
          icon={Code2}
          title="Skills"
          items={skills}
          emptyText="No skills added yet."
        />

        <InfoCard
          icon={Heart}
          title="Interests"
          items={interests}
          emptyText="No interests added yet."
        />
      </section>

      {/* Experience */}
      {profile?.experience && (
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">Experience</h2>
          </div>

          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {profile.experience}
          </p>
        </section>
      )}

      {/* Availability */}
      {profile?.availability && (
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">Availability</h2>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {profile.availability}
          </p>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, items, emptyText }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>

        <h2 className="font-semibold">{title}</h2>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}
    </section>
  );
}

export default StudentProfile;
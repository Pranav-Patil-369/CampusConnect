import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  BriefcaseBusiness,
  Code2,
  Heart,
  Clock3,
  Pencil,
  Save,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/profile";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    college: "",
    course: "",
    year: "",
    skills: "",
    interests: "",
    availability: "",
    experience: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName = user?.name || "Student";
  const userEmail = user?.email || "";

  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 404) {
        setProfile(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      setProfile(data);

      setFormData({
        bio: data.bio || "",
        college: data.college || "",
        course: data.course || "",
        year: data.year || "",
        skills: data.skills || "",
        interests: data.interests || "",
        availability: data.availability || "",
        experience: data.experience || "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        college: profile.college || "",
        course: profile.course || "",
        year: profile.year || "",
        skills: profile.skills || "",
        interests: profile.interests || "",
        availability: profile.availability || "",
        experience: profile.experience || "",
      });
    }

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        year: formData.year ? Number(formData.year) : undefined,
      };

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setProfile(data.profile);

      setFormData({
        bio: data.profile.bio || "",
        college: data.profile.college || "",
        course: data.profile.course || "",
        year: data.profile.year || "",
        skills: data.profile.skills || "",
        interests: data.profile.interests || "",
        availability: data.profile.availability || "",
        experience: data.profile.experience || "",
      });

      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label,
    name,
    value,
    placeholder,
    type = "text"
  ) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium">{label}</label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={type === "number" ? "1" : undefined}
          max={type === "number" ? "6" : undefined}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section>
        <p className="text-sm font-medium text-primary">My Profile</p>

        <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Profile
            </h1>

            <p className="mt-2 text-muted-foreground">
              Tell other students about your skills, interests, and experience.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Profile Header Card */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {userInitial}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{userName}</h2>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {userEmail}
            </div>
          </div>
        </div>
      </section>

      {isEditing ? (
        /* ================= EDIT MODE ================= */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic / Academic */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Academic Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Add information about your college and course.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {renderField(
                "College",
                "college",
                formData.college,
                "Enter your college"
              )}

              {renderField(
                "Course / Branch",
                "course",
                formData.course,
                "e.g. Computer Science Engineering"
              )}

              {renderField(
                "Year",
                "year",
                formData.year,
                "e.g. 3",
                "number"
              )}

              {renderField(
                "Availability",
                "availability",
                formData.availability,
                "e.g. Evenings and weekends"
              )}
            </div>
          </section>

          {/* About */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">About You</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Help other students understand what you are interested in.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell students a little about yourself..."
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Experience
                </label>

                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Projects, internships, hackathons, etc."
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Skills & Interests */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Skills & Interests
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Separate multiple skills or interests with commas.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {renderField(
                "Skills",
                "skills",
                formData.skills,
                "Python, React, Node.js..."
              )}

              {renderField(
                "Interests",
                "interests",
                formData.interests,
                "AI, Startups, Web Development..."
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      ) : (
        /* ================= VIEW MODE ================= */
        <>
          {!profile ? (
            <section className="rounded-xl border bg-card p-10 text-center">
              <User className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                Your profile isn't complete yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Add your academic information, skills, interests, and
                experience so other students can discover you.
              </p>

              <button
                type="button"
                onClick={handleEdit}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Pencil className="h-4 w-4" />
                Create Profile
              </button>
            </section>
          ) : (
            <>
              {/* Academic Information */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold">
                  Academic Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <InfoItem
                    icon={GraduationCap}
                    label="College"
                    value={profile.college}
                  />

                  <InfoItem
                    icon={GraduationCap}
                    label="Course / Branch"
                    value={profile.course}
                  />

                  <InfoItem
                    icon={GraduationCap}
                    label="Year"
                    value={profile.year}
                  />
                </div>
              </section>

              {/* About */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold">About</h2>

                <div className="mt-5 space-y-6">
                  <InfoItem
                    icon={User}
                    label="Bio"
                    value={profile.bio}
                    fullWidth
                  />

                  <InfoItem
                    icon={BriefcaseBusiness}
                    label="Experience"
                    value={profile.experience}
                    fullWidth
                  />
                </div>
              </section>

              {/* Skills / Interests */}
              <section className="grid gap-6 md:grid-cols-2">
                <InfoCard
                  icon={Code2}
                  title="Skills"
                  value={profile.skills}
                />

                <InfoCard
                  icon={Heart}
                  title="Interests"
                  value={profile.interests}
                />
              </section>

              {/* Availability */}
              <section className="rounded-xl border bg-card p-6">
                <InfoItem
                  icon={Clock3}
                  label="Availability"
                  value={profile.availability}
                />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "max-w-3xl" : ""}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <p className="mt-2 text-sm leading-6">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>

        <h2 className="font-semibold">{title}</h2>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {value || "Not added yet"}
      </p>
    </section>
  );
}

export default Profile;
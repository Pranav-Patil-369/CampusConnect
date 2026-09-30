import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Branding Section */}
        <div className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">
                C
              </div>

              <span className="text-xl font-bold">CampusConnect</span>
            </div>

            <div className="mt-24 max-w-lg">
              <p className="text-sm font-medium text-primary-foreground/70">
                CONNECT • COLLABORATE • CONTRIBUTE
              </p>

              <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
                Your next great collaboration could start here.
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-primary-foreground/75">
                Create your profile, find students with complementary skills,
                and turn ideas into real projects.
              </p>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Start building your campus network today.
          </p>
        </div>

        {/* Register Section */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                C
              </div>

              <h1 className="mt-3 text-2xl font-bold text-foreground">
                CampusConnect
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Connect. Collaborate. Contribute.
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="text-sm font-medium text-primary">
                GET STARTED
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-muted-foreground">
                Join CampusConnect and start finding people, projects, and
                opportunities.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
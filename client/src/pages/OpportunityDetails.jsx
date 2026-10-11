import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000";

function OpportunityDetails() {
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/opportunities/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load opportunity"
          );
        }

        setOpportunity(data.opportunity);
      } catch (error) {
        console.error("Fetch opportunity error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "No deadline specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          Loading opportunity...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard/opportunities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-semibold text-destructive">
            Opportunity not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        to="/dashboard/opportunities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Link>

      {/* Main Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        {/* Type */}
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {opportunity.type}
        </span>

        {/* Title */}
        <h1 className="mt-5 text-3xl font-bold">
          {opportunity.title}
        </h1>

        {/* Organization */}
        <p className="mt-2 text-lg text-muted-foreground">
          {opportunity.organization}
        </p>

        {/* Deadline */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />

          <span>
            Deadline: {formatDate(opportunity.deadline)}
          </span>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">
            About this opportunity
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {opportunity.description}
          </p>
        </div>

        {/* External Link */}
        {opportunity.link && (
          <div className="mt-8">
            <a
              href={opportunity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Visit Opportunity
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityDetails;
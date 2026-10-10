import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/invitations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load invitations");
      }

      setInvitations(data.invitations || []);
    } catch (error) {
      console.error("Fetch invitations error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAction = async (invitationId, action) => {
    try {
      setActionId(invitationId);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/invitations/${invitationId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} invitation`);
      }

      await fetchInvitations();
    } catch (error) {
      console.error(`Invitation ${action} error:`, error);
      setError(error.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          Loading invitations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>

          <span className="text-muted-foreground">/</span>

          <span className="text-sm">Invitations</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Project Invitations
        </h1>

        <p className="mt-2 text-muted-foreground">
          View invitations from students who want you to join their projects.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {invitations.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h2 className="text-xl font-semibold">
            No invitations yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            When someone invites you to join a project, it will appear here.
          </p>

          <Link
            to="/dashboard/discover"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Discover Students
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Invitation information */}
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {invitation.project.name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          invitation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : invitation.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invitation.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Invited by{" "}
                      <span className="font-medium text-foreground">
                        {invitation.sender.name}
                      </span>
                    </p>
                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {invitation.project.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="rounded-md bg-muted px-3 py-2">
                      <span className="text-muted-foreground">
                        Role:
                      </span>{" "}
                      <span className="font-medium">
                        {invitation.role}
                      </span>
                    </div>

                    <div className="rounded-md bg-muted px-3 py-2">
                      <span className="text-muted-foreground">
                        Duration:
                      </span>{" "}
                      <span className="font-medium">
                        {invitation.project.duration}
                      </span>
                    </div>

                    <div className="rounded-md bg-muted px-3 py-2">
                      <span className="text-muted-foreground">
                        Team:
                      </span>{" "}
                      <span className="font-medium">
                        {invitation.project.teamSize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {invitation.status === "pending" && (
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() =>
                        handleAction(invitation.id, "reject")
                      }
                      disabled={actionId === invitation.id}
                      className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        handleAction(invitation.id, "accept")
                      }
                      disabled={actionId === invitation.id}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionId === invitation.id
                        ? "Processing..."
                        : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Invitations;
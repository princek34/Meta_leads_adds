import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Activity,
  Users,
  Radio,
  RefreshCw,
  CheckCircle2,
  Clock3,
  X,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  FileText,
  ExternalLink,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:3000";

function App() {
  const [leads, setLeads] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  async function fetchLeads() {
    try {
      setError("");
      const response = await fetch(`${API_URL}/api/leads`);

      if (!response.ok) {
        throw new Error("Unable to fetch leads");
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch {
      setError("Backend connection failed. Check that port 3000 is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();

    const socket = io(API_URL);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("lead:event", (event) => {
      if (event?.leadgen_id) {
        setLeads((previous) => {
          const exists = previous.some(
            (lead) => lead.leadgen_id === event.leadgen_id
          );

          if (exists) return previous;
          return [event, ...previous];
        });
      } else {
        fetchLeads();
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedLead) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedLead(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLead]);

  // Supports contact fields if your backend provides them.
  // Meta Graph API field_data is also supported when available.
  function getContactField(lead, fieldName) {
    const directValue = lead?.[fieldName];

    if (directValue) {
      return Array.isArray(directValue)
        ? directValue.join(", ")
        : String(directValue);
    }

    const field = lead?.field_data?.find(
      (item) => item.name?.toLowerCase() === fieldName.toLowerCase()
    );

    if (field?.values?.length) {
      return field.values.join(", ");
    }

    return "Not available";
  }

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={23} />
          </div>
          <div>
            <h1>LeadFlow</h1>
            <p>Meta Lead Ads Dashboard</p>
          </div>
        </div>

        <div className={`connection ${connected ? "online" : "offline"}`}>
          <span className="status-dot" />
          {connected ? "Live connection" : "Connecting..."}
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">LEAD MANAGEMENT</p>
          <h2>Lead Activity Overview</h2>
          <p className="subtitle">
            Monitor webhook notifications and incoming lead events.
          </p>
        </div>

        <button className="refresh-button" onClick={fetchLeads}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon purple">
            <Users size={22} />
          </div>
          <p>Total notifications</p>
          <h3>{leads.length}</h3>
          <span>Recorded by backend</span>
        </article>

        <article className="stat-card">
          <div className="stat-icon green">
            <Radio size={22} />
          </div>
          <p>Socket.IO status</p>
          <h3>{connected ? "Online" : "Offline"}</h3>
          <span>Real-time event channel</span>
        </article>

        <article className="stat-card">
          <div className="stat-icon orange">
            <Clock3 size={22} />
          </div>
          <p>Latest notification</p>
          <h3 className="latest-value">
            {leads.length ? "Received" : "Waiting"}
          </h3>
          <span>Webhook activity</span>
        </article>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h3>Incoming lead events</h3>
            <p>Click any lead row to view its available details</p>
          </div>
          <span className="event-count">{leads.length} events</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading notifications...</p>
        ) : leads.length === 0 ? (
          <p className="empty-state">No notifications received yet.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Form ID</th>
                  <th>Page ID</th>
                  <th>Event</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={`${lead.leadgen_id || "lead"}-${index}`}
                    className="clickable-lead-row"
                    onClick={() => setSelectedLead(lead)}
                    title="Click to view lead details"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedLead(lead);
                      }
                    }}
                  >
                    <td className="lead-id">
                      <button
                        type="button"
                        className="lead-id-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedLead(lead);
                        }}
                      >
                        {lead.leadgen_id || "Unknown ID"}
                        <ExternalLink size={13} />
                      </button>
                    </td>
                    <td>{lead.form_id || "—"}</td>
                    <td>{lead.page_id || "—"}</td>
                    <td>
                      <span className="event-badge">
                        {lead.event_type || "leadgen"}
                      </span>
                    </td>
                    <td>
                      <span className="received-status">
                        <CheckCircle2 size={14} />
                        {lead.status || "notification_received"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedLead && (
        <div
          className="lead-modal-backdrop"
          onClick={() => setSelectedLead(null)}
          role="presentation"
        >
          <section
            className="lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="lead-modal-header">
              <div>
                <p className="eyebrow">LEAD INFORMATION</p>
                <h2 id="lead-modal-title">Lead Details</h2>
                <p className="modal-lead-id">
                  ID: {selectedLead.leadgen_id || "Not available"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => setSelectedLead(null)}
                aria-label="Close lead details"
              >
                <X size={21} />
              </button>
            </header>

            <div className="lead-modal-body">
              <div className="modal-section">
                <h3>Contact Information</h3>

                <div className="detail-item">
                  <UserRound size={18} />
                  <div>
                    <span>Full Name</span>
                    <strong>{getContactField(selectedLead, "full_name")}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Mail size={18} />
                  <div>
                    <span>Email Address</span>
                    <strong>{getContactField(selectedLead, "email")}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Phone size={18} />
                  <div>
                    <span>Phone Number</span>
                    <strong>{getContactField(selectedLead, "phone_number")}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Meta Lead Information</h3>

                <div className="detail-item">
                  <FileText size={18} />
                  <div>
                    <span>Form ID</span>
                    <strong>{selectedLead.form_id || "Not available"}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Users size={18} />
                  <div>
                    <span>Page ID</span>
                    <strong>{selectedLead.page_id || "Not available"}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Activity size={18} />
                  <div>
                    <span>Ad ID</span>
                    <strong>{selectedLead.ad_id || "Not available"}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <CheckCircle2 size={18} />
                  <div>
                    <span>Event Type</span>
                    <strong>
                      {selectedLead.event_type || "leadgen"}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Radio size={18} />
                  <div>
                    <span>Status</span>
                    <strong>
                      {selectedLead.status || "notification_received"}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <CalendarDays size={18} />
                  <div>
                    <span>Created Time</span>
                    <strong>{formatDate(selectedLead.created_time)}</strong>
                  </div>
                </div>
              </div>

              {Array.isArray(selectedLead.field_data) &&
                selectedLead.field_data.length > 0 && (
                  <div className="modal-section">
                    <h3>Additional Form Answers</h3>
                    {selectedLead.field_data.map((field, index) => (
                      <div className="detail-item" key={`${field.name}-${index}`}>
                        <FileText size={18} />
                        <div>
                          <span>{field.name || "Form field"}</span>
                          <strong>
                            {field.values?.join(", ") || "Not available"}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              <p className="modal-note">
                Only information supplied by the backend is shown. Contact
                details require actual lead data to be retrieved and stored.
              </p>
            </div>

            <footer className="lead-modal-footer">
              <button
                type="button"
                className="refresh-button"
                onClick={() => setSelectedLead(null)}
              >
                Close Details
              </button>
            </footer>
          </section>
        </div>
      )}

      <footer>
        <span>LeadFlow PoC</span>
        <span>Express · React · Socket.IO</span>
      </footer>
    </main>
  );
}

export default App;
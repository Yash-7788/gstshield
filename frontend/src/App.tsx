import { useEffect, useMemo, useState } from "react";

import { ApiClient, apiOrigin } from "./client";

import type { Schemas } from "./contracts";

import { Notice, useCommand, useResource } from "./shared";

import type { Context } from "./shared";

import Sources from "./Sources";

import Reconciliation from "./Reconciliation";

import Cases from "./Cases";

import Actions from "./Actions";

import Proposals from "./Proposals";

import Reports from "./Reports";

function sectionFromHash() {
  try {
    const value = decodeURIComponent(location.hash.slice(1));
    return sections.includes(value) ? value : "Sources";
  } catch {
    return "Sources";
  }
}

const sections = [
  "Sources",
  "Reconciliation",
  "Cases & evidence",
  "Work queue",
  "Payment drafts",
  "Reports",
];

function Login({
  api,
  onSession,
}: {
  api: ApiClient;
  onSession: (s: Schemas["SessionData"]) => void;
}) {
  const action = useCommand();

  return (
    <main className="login">
      <span className="eyebrow">Your GST evidence workspace</span>
      <h1>GSTShield</h1>
      <p>Keep your invoices, review history and next actions together.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void action.run(
            () =>
              api.auth<Schemas["SessionData"]>("/api/v1/auth/login", {
                username: data.get("username"),
                password: data.get("password"),
              }),
            onSession,
          );
        }}
      >
        <label>
          Username
          <input
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={64}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={12}
            maxLength={128}
          />
        </label>
        <button disabled={action.busy}>
          {action.busy ? "Signing in…" : "Sign in"}
        </button>
        {action.feedback}
      </form>
      <p className="muted">
        Use the account created by your local operator. This demonstration runs
        on your PC.
      </p>
    </main>
  );
}

function rememberedSelection(userId: string) {
  try {
    const value = JSON.parse(
      sessionStorage.getItem("gstshield_selection") || "null",
    );
    if (
      value?.user_id === userId &&
      typeof value.workspace_id === "string" &&
      typeof value.registration_id === "string" &&
      typeof value.period === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(value.period)
    )
      return value as {
        workspace_id: string;
        registration_id: string;
        period: string;
      };
  } catch {}
  return {
    workspace_id: "",
    registration_id: "",
    period: new Date().toISOString().slice(0, 7),
  };
}
function Workspace({
  api,
  user,
  logout,
}: {
  api: ApiClient;
  user: Schemas["SessionData"];
  logout: () => void;
}) {
  const workspaces = useResource<Schemas["WorkspaceData"][]>(
    api,
    "/api/v1/workspaces",
  );

  const [remembered] = useState(() => rememberedSelection(user.user_id));
  const [workspaceId, setWorkspace] = useState(remembered.workspace_id);
  const selected =
    workspaces.data?.find((w) => w.id === workspaceId) || workspaces.data?.[0];

  const registrations = useResource<Schemas["RegistrationData"][]>(
    api,
    selected ? `/api/v1/workspaces/${selected.id}/registrations` : null,
  );

  const [registrationId, setRegistration] = useState(
    remembered.registration_id,
  );
  const registration =
    registrations.data?.find((r) => r.id === registrationId) ||
    registrations.data?.[0];

  const [period, setPeriod] = useState(remembered.period);

  const [section, setSection] = useState(sectionFromHash);

  useEffect(() => {
    const change = () => {
      setSection(sectionFromHash());
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);

  const context: Context | null =
    selected &&
    registration &&
    !period.startsWith("0000") &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(period)
      ? { api, user, workspace: selected, registration, period }
      : null;

  useEffect(() => {
    if (context)
      sessionStorage.setItem(
        "gstshield_selection",
        JSON.stringify({
          user_id: user.user_id,
          workspace_id: context.workspace.id,
          registration_id: context.registration.id,
          period,
        }),
      );
  }, [user.user_id, selected?.id, registration?.id, period]);
  const key = `${user.user_id}:${selected?.id}:${registration?.id}:${period}:${section}`;

  return (
    <div className="app">
      <header>
        <div>
          <strong className="brand">GSTShield</strong>
          <span className="muted">Evidence → review → next action</span>
        </div>
        <div>
          <span>{user.username}</span>{" "}
          <button className="secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <div className="context">
        <label>
          Workspace
          <select
            value={selected?.id || ""}
            onChange={(e) => {
              setWorkspace(e.target.value);
              setRegistration("");
            }}
          >
            {workspaces.data?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} · {w.role.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <label>
          Registration
          <select
            value={registration?.id || ""}
            onChange={(e) => setRegistration(e.target.value)}
          >
            {registrations.data?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.display_name} · {r.gstin}
              </option>
            ))}
          </select>
        </label>
        <label>
          Accounting month
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
      </div>
      <div className="layout">
        <nav aria-label="Workspace sections">
          {sections.map((name) => (
            <a
              key={name}
              href={`#${encodeURIComponent(name)}`}
              aria-current={section === name ? "page" : undefined}
            >
              {name}
            </a>
          ))}
        </nav>
        <main>
          <h1>{section}</h1>
          {workspaces.error && (
            <Notice error>
              {workspaces.error}{" "}
              <button onClick={workspaces.reload}>Retry</button>
            </Notice>
          )}
          {registrations.error && (
            <Notice error>
              {registrations.error}{" "}
              <button onClick={registrations.reload}>Retry</button>
            </Notice>
          )}
          {!context ? (
            <Notice>
              {workspaces.loading || registrations.loading
                ? "Loading your permitted workspace…"
                : "Select a workspace, registration and valid accounting month. Ask the operator if none is listed."}
            </Notice>
          ) : (
            <section key={key}>
              {selected?.role === "VIEWER" && (
                <Notice>You have read-only access.</Notice>
              )}
              {section === "Sources" && <Sources c={context} />}{" "}
              {section === "Reconciliation" && <Reconciliation c={context} />}{" "}
              {section === "Cases & evidence" && <Cases c={context} />}{" "}
              {section === "Work queue" && <Actions c={context} />}{" "}
              {section === "Payment drafts" && <Proposals c={context} />}{" "}
              {section === "Reports" && <Reports c={context} />}
            </section>
          )}
          <footer>
            Reviews and recorded observations do not verify legal entitlement or
            perform tax filing, payments or WhatsApp delivery.
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Schemas["SessionData"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const setup = useMemo(() => {
    try {
      return {
        api: new ApiClient(
          apiOrigin(import.meta.env.VITE_API_BASE_URL, location),
        ),
        error: "",
      };
    } catch (error) {
      return {
        api: null,
        error:
          error instanceof Error ? error.message : "Configuration unavailable",
      };
    }
  }, []);

  const api = setup.api;

  if (api)
    api.onExpired = () => {
      api.reset();
      sessionStorage.removeItem("gstshield_selection");
      setSession(null);
      setMessage("Your access has expired or been revoked. Sign in again.");
    };

  const accept = (data: Schemas["SessionData"]) => {
    if (api) {
      sessionStorage.removeItem("gstshield_signed_out");
      api.csrf = data.csrf_token;
      setSession(data);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!api || sessionStorage.getItem("gstshield_signed_out")) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    api
      .get<Schemas["SessionData"]>("/api/v1/auth/session", controller.signal)
      .then(accept)
      .catch((error) => {
        if (!controller.signal.aborted && error.status !== 401)
          setMessage(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api]);

  useEffect(() => {
    if (!api || !session) return;
    const timer = setTimeout(
      () => {
        api.reset();
        sessionStorage.removeItem("gstshield_selection");
        setSession(null);
        setMessage("Your session expired. Sign in again.");
      },
      Math.max(0, Date.parse(session.expires_at) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [api, session]);

  if (!api)
    return (
      <main className="login">
        <h1>GSTShield</h1>
        <Notice error>{setup.error}</Notice>
      </main>
    );

  if (loading)
    return (
      <main className="login">
        <Notice>Checking your session…</Notice>
      </main>
    );

  const logout = () => {
    sessionStorage.setItem("gstshield_signed_out", "1");
    sessionStorage.removeItem("gstshield_selection");
    setSession(null);
    const signout = new ApiClient(api.base);
    signout.csrf = api.csrf;
    api.reset();
    const pending = signout.auth("/api/v1/auth/logout");
    void pending
      .then(() => setMessage("Signed out."))
      .catch(() =>
        setMessage(
          "Private screens are cleared. Server sign-out could not be confirmed; the cookie remains valid until expiry or operator revocation. Explicit sign-in is required here.",
        ),
      );
  };

  return (
    <>
      {message && <Notice>{message}</Notice>}
      {session ? (
        <Workspace
          key={session.user_id}
          api={api}
          user={session}
          logout={logout}
        />
      ) : (
        <Login api={api} onSession={accept} />
      )}
    </>
  );
}

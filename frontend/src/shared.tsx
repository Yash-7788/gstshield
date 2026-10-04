import { useCallback, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

import { ApiClient, ApiError } from "./client";

import type { Schemas } from "./contracts";

export type Context = {
  api: ApiClient;
  user: Schemas["SessionData"];
  workspace: Schemas["WorkspaceData"];
  registration: Schemas["RegistrationData"];
  period: string;
};

export const path = (c: Context, suffix: string) =>
  `/api/v1/workspaces/${c.workspace.id}/${suffix}`;

export const writable = (c: Context) => c.workspace.role !== "VIEWER";

export const text = (value: unknown): string =>
  value === null || value === undefined
    ? "Unknown"
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

export const label = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

export function money(value: unknown) {
  if (typeof value !== "string" || !/^-?\d+\.\d{2}$/.test(value))
    return "Unknown";

  const [whole, fraction] = value.split(".");
  return `₹${new Intl.NumberFormat("en-IN").format(BigInt(whole))}.${fraction}`;
}

export const utcDay = () => new Date().toISOString().slice(0, 10);

export function date(value: unknown) {
  if (value === null || value === undefined) return "Not recorded";
  const d = new Date(typeof value === "number" ? value * 1000 : String(value));
  return Number.isNaN(d.valueOf()) ? "Not recorded" : d.toLocaleString();
}

export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={error ? "notice error" : "notice"}
    >
      {children}
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  return <span className="badge">{label(value)}</span>;
}

export function Facts({ values }: { values: Record<string, unknown> }) {
  return (
    <dl className="facts">
      {Object.entries(values).map(([k, v]) => (
        <div key={k}>
          <dt>{label(k)}</dt>
          <dd>{text(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function History({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <details>
      <summary>Evidence and action history ({rows.length})</summary>
      {rows.map((row, i) => (
        <article key={text(row.id) + i}>
          <strong>{label(text(row.kind || row.action))}</strong>{" "}
          <small>{date(row.created_at)}</small>
          <Facts values={row} />
        </article>
      ))}
    </details>
  );
}

export function useResource<T>(
  api: ApiClient,
  url: string | null,
  watch: boolean | number = false,
) {
  const [state, setState] = useState<{
    url: string | null;
    data: T | null;
    error: string;
    loading: boolean;
    denied: boolean;
  }>({ url: null, data: null, error: "", loading: false, denied: false });

  const [revision, bump] = useState(0);
  const reload = useCallback(() => bump((v) => v + 1), []);

  useEffect(() => {
    setState({ url, data: null, error: "", loading: !!url, denied: false });
    if (!url) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      timer = setTimeout(
        () => {
          if (document.visibilityState === "visible") void load();
          else schedule();
        },
        typeof watch === "number" ? watch : 2000,
      );
    };

    const load = async () => {
      let again = typeof watch === "number";

      try {
        const data = await api.get<T>(url, controller.signal);
        if (!controller.signal.aborted)
          setState({ url, data, error: "", loading: false, denied: false });
        const status = (data as { state?: string }).state;
        again ||=
          watch === true &&
          !!status &&
          ["PENDING", "QUEUED", "RUNNING", "PARSING", "RECEIVED"].includes(
            status,
          );
      } catch (error) {
        if (!controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            data:
              error instanceof ApiError &&
              [401, 403, 404].includes(error.status)
                ? null
                : previous.data,
            error: error instanceof Error ? error.message : "Unable to load",
            loading: false,
            denied:
              error instanceof ApiError &&
              [401, 403, 404].includes(error.status),
          }));
      }

      if (!controller.signal.aborted && again) schedule();
    };

    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [api, url, revision, watch]);

  return {
    ...(state.url === url
      ? state
      : { data: null, error: "", loading: !!url, denied: false }),
    reload,
  };
}

export function useCommand() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const alive = useRef(true);
  const gate = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function run<T>(
    work: () => Promise<T>,
    done?: (result: T) => void,
    success = "Saved. The backend record has been updated.",
  ) {
    if (gate.current) return;
    gate.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await work();
      if (alive.current) {
        done?.(result);
        setMessage(success);
      }
    } catch (error) {
      if (alive.current)
        setError(error instanceof Error ? error.message : "Action unavailable");
    } finally {
      gate.current = false;
      if (alive.current) setBusy(false);
    }
  }

  return {
    busy,
    run,
    message,
    error,
    feedback: (
      <>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
      </>
    ),
  };
}

export function LoadState({
  loading,
  error,
  empty,
  reload,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  reload: () => void;
}) {
  return (
    <>
      {loading && <Notice>Loading saved records…</Notice>}
      {error && (
        <Notice error>
          {error} <button onClick={reload}>Retry loading</button>
        </Notice>
      )}
      {!loading && !error && empty && (
        <Notice>No saved records in this selection yet.</Notice>
      )}
    </>
  );
}

export function Field({
  name,
  children,
  type = "text",
  value,
  required = false,
  maxLength = 1000,
  pattern,
}: {
  name: string;
  children: ReactNode;
  type?: string;
  value?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
}) {
  return (
    <label>
      {children}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        step={type === "number" ? "1" : undefined}
      />
    </label>
  );
}

export function values(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(
    [...new FormData(form)].map(([k, v]) => [k, String(v)]),
  );
}

export function payloadError(message: string): never {
  throw new ApiError(message, 422, "INPUT_INVALID");
}

export function Job({ c, id }: { c: Context; id: string }) {
  const job = useResource<Schemas["JobData"]>(
    c.api,
    path(c, `jobs/${id}`),
    true,
  );
  return (
    <>
      <LoadState {...job} empty={false} />
      {job.data && (
        <Notice>
          Processing job: {label(job.data.state)}{" "}
          {job.data.error_code ? `· ${job.data.error_code}` : ""}
        </Notice>
      )}
    </>
  );
}

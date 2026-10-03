import { useState } from "react";

import type { Schemas } from "./contracts";

import {
  Job,
  Badge,
  Field,
  Facts,
  History,
  LoadState,
  Notice,
  money,
  path,
  text,
  useCommand,
  useResource,
  values,
  writable,
} from "./shared";

import type { Context } from "./shared";

export function Results({
  c,
  run,
  updated,
}: {
  c: Context;
  run: Schemas["RunData"];
  updated: () => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState("");

  const results = useResource<Schemas["ResultListData"]>(
    c.api,
    path(
      c,
      `runs/${run.id}/results?limit=20&cursor=${cursor}${status ? `&status=${status}` : ""}`,
    ),
  );

  const detail = useResource<Schemas["ResultDetail"]>(
    c.api,
    selected ? path(c, `results/${selected}`) : null,
  );

  const action = useCommand();
  const item = detail.data;

  return (
    <>
      <div className="controls">
        <label>
          Result category
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCursor(0);
            }}
          >
            <option value="">All categories</option>
            {[
              "EXACT_MATCH",
              "FUZZY_SUGGESTION",
              "MISSING_IN_SNAPSHOT",
              "AMOUNT_MISMATCH",
              "AMBIGUOUS",
              "EVIDENCE_INCOMPLETE",
              "REVIEW_ACCEPTED",
              "REJECTED",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button className="secondary" onClick={results.reload}>
          Refresh results
        </button>
      </div>
      <LoadState {...results} empty={!results.data?.results.length} />
      {results.data && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice / supplier</th>
                  <th>Recorded GST</th>
                  <th>Category</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {results.data.results.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {text(row.canonical.invoice_number)}
                      <br />
                      <small>{text(row.canonical.supplier_gstin)}</small>
                    </td>
                    <td>{money(row.canonical.total_tax)}</td>
                    <td>
                      <Badge value={row.status} />
                    </td>
                    <td>
                      <button onClick={() => setSelected(row.id)}>
                        Open result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="controls">
            <button
              className="secondary"
              disabled={!cursor}
              onClick={() => setCursor(0)}
            >
              First results
            </button>
            <button
              className="secondary"
              disabled={results.data.next_cursor === null}
              onClick={() => setCursor(results.data!.next_cursor!)}
            >
              Next results
            </button>
          </div>
        </>
      )}

      <LoadState {...detail} empty={false} />
      {item && (
        <article>
          <h3>Review invoice {text(item.canonical.invoice_number)}</h3>
          <Facts values={item.canonical} />
          <Notice>
            {item.reason_codes.join(" Â· ") ||
              "No discrepancy reasons recorded."}{" "}
            A match is not a legal credit approval.
          </Notice>
          <History rows={item.review_timeline} />
          {item.candidates.map((candidate) => (
            <article key={candidate.id}>
              <strong>Candidate {candidate.original_invoice_number}</strong>
              <Facts
                values={{
                  similarity: candidate.score,
                  invoice_date: candidate.invoice_date,
                  eligible: candidate.hard_gates_passed,
                  available: candidate.currently_available,
                  ...candidate.amount_differences,
                }}
              />
            </article>
          ))}
          {writable(c) && run.sources_current && run.state === "COMPLETED" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = values(e.currentTarget);
                void action.run(
                  () =>
                    c.api.command(path(c, `results/${item.id}/review`), {
                      expected_version: item.version,
                      action: v.action,
                      reason: v.reason,
                      candidate_id:
                        v.action === "ACCEPT_CANDIDATE" ? v.candidate : null,
                    }),
                  () => {
                    detail.reload();
                    results.reload();
                    updated();
                  },
                );
              }}
            >
              <label>
                Decision
                <select name="action">
                  <option value="REJECT_MATCH">
                    Reject match / record concern
                  </option>
                  <option value="ACCEPT_CANDIDATE">
                    Accept eligible candidate
                  </option>
                </select>
              </label>
              <label>
                Candidate
                <select name="candidate">
                  <option value="">Select for acceptance</option>
                  {item.candidates
                    .filter((x) => x.hard_gates_passed && x.currently_available)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.original_invoice_number} Â· similarity {x.score}
                      </option>
                    ))}
                </select>
              </label>
              <Field name="reason" required>
                Review reason
              </Field>
              <button disabled={action.busy}>Save review</button>
            </form>
          )}
          {action.feedback}
        </article>
      )}
    </>
  );
}

export default function Reconciliation({ c }: { c: Context }) {
  const [cursor, setCursor] = useState("");
  const [selected, setSelected] = useState("");
  const action = useCommand();

  const imports = useResource<Schemas["ImportListData"]>(
    c.api,
    path(
      c,
      `imports?registration_id=${c.registration.id}&period=${c.period}&limit=100`,
    ),
  );

  const runs = useResource<Schemas["RunListData"]>(
    c.api,
    path(c, `runs?limit=20${cursor ? `&cursor=${cursor}` : ""}`),
  );

  const detail = useResource<Schemas["RunData"]>(
    c.api,
    selected ? path(c, `runs/${selected}`) : null,
    true,
  );
  const run = detail.data;

  const ready = imports.data?.imports.filter((i) => i.state === "READY") || [];

  return (
    <>
      <p>
        Compare retained purchases with a confirmed supplier snapshot. Review
        suggestions instead of treating them as verified matches.
      </p>
      {writable(c) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = values(e.currentTarget);
            void action.run(
              () =>
                c.api.command<Schemas["RunData"]>(path(c, "runs"), {
                  registration_id: c.registration.id,
                  period: c.period,
                  purchase_import_id: v.purchase,
                  portal_import_id: v.portal,
                }),
              (result) => {
                setSelected(result.id);
                runs.reload();
              },
            );
          }}
        >
          <div className="grid">
            <label>
              Confirmed purchases
              <select name="purchase" required>
                <option value="">Select a purchase source</option>
                {ready
                  .filter((i) => i.kind === "PURCHASE")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id.slice(0, 8)} Â· {i.accepted_rows} rows
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Confirmed supplier / 2B snapshot
              <select name="portal" required>
                <option value="">Select a supplier snapshot</option>
                {ready
                  .filter((i) => i.kind === "PORTAL_2B")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id.slice(0, 8)} Â· {i.accepted_rows} rows
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <button
            disabled={
              action.busy ||
              !ready.some((i) => i.kind === "PURCHASE") ||
              !ready.some((i) => i.kind === "PORTAL_2B")
            }
          >
            Compare sources
          </button>
          {action.feedback}
        </form>
      )}

      <LoadState {...imports} empty={false} />
      <div className="controls">
        <button className="secondary" onClick={runs.reload}>
          Refresh comparisons
        </button>
      </div>
      <LoadState {...runs} empty={!runs.data?.runs.length} />
      {runs.data && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Comparison</th>
                  <th>State / evidence</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {runs.data.runs
                  .filter(
                    (r) =>
                      r.registration_id === c.registration.id &&
                      r.period === c.period,
                  )
                  .map((r) => (
                    <tr key={r.id}>
                      <td>
                        Revision {r.revision} Â· {r.id.slice(0, 8)}
                      </td>
                      <td>
                        <Badge value={r.state} /> <Badge value={r.provenance} />
                      </td>
                      <td>
                        <button onClick={() => setSelected(r.id)}>
                          Open comparison
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="controls">
            <button
              className="secondary"
              disabled={!cursor}
              onClick={() => setCursor("")}
            >
              First comparisons
            </button>
            <button
              className="secondary"
              disabled={!runs.data.next_cursor}
              onClick={() => setCursor(runs.data!.next_cursor!)}
            >
              Next comparisons
            </button>
          </div>
        </>
      )}

      <LoadState {...detail} empty={false} />
      {run && (
        <article>
          <h2>Comparison revision {run.revision}</h2>
          <Badge value={run.state} />
          <Job c={c} id={run.job_id} />
          {!run.sources_current && (
            <Notice error>
              Earlier evidence changed. This comparison is historical; create a
              current comparison before consequential review.
            </Notice>
          )}
          {run.summary && (
            <>
              <p>
                Recorded GST needing review:{" "}
                <strong>{money(run.summary.tax_exposure_review)}</strong> ·
                unknown tax rows: {run.summary.unknown_tax_exposure_rows}
              </p>
              <Facts values={run.summary.counts} />
            </>
          )}
          <button className="secondary" onClick={detail.reload}>
            Refresh comparison
          </button>
          {run.state === "FAILED" && (
            <Notice error>
              Processing failed. See the job status; retry with a new comparison
              after correcting the cause.
            </Notice>
          )}
          {["COMPLETED", "SUPERSEDED"].includes(run.state) && (
            <Results
              key={run.id}
              c={c}
              run={run}
              updated={() => {
                detail.reload();
                runs.reload();
              }}
            />
          )}
        </article>
      )}
    </>
  );
}

# Proposed contributor backlog

This is a planning backlog, not a list of published GitHub issues or approved Wave tasks. Create each GitHub issue only when its prerequisites exist. Each issue should have acceptance criteria, a fixture or reproducible example, and a review owner. Keep Wave issue selection within the program's current points budget.

A02 and A03 have now been completed locally; the live signer fixture and inspector cover them. A14 remains a separate future authenticated scan endpoint. The current public preview is bounded and testnet-only.

W01 through W04 have first-pass implementations in the preview dashboard. They still need pilot feedback, with W05 (filtering) available as a distinct follow-up. Any Wave issue should describe a new, reviewable change rather than re-listing completed work.

## API and Stellar work

| ID  | Proposed issue                                    | Acceptance criteria                                                                                                       | Prerequisite                    |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| A01 | Document fixture transaction structure            | Explain the two transactions, required signers, expected Horizon fields, and failure cases from the live fixture.         | Proof complete                  |
| A02 | Add sponsored signer fixtures                     | Create a testnet sponsored signer and show its one reserve unit in the sponsor aggregate. No private key output.          | Proof complete                  |
| A03 | Itemize sponsored signers                         | Report signers with matching sponsor and reconcile against a sponsored-signer fixture.                                    | A02                             |
| A04 | Add sponsored data-entry fixtures                 | Produce a testnet data entry and known sponsor count.                                                                     | Proof complete                  |
| A05 | Itemize sponsored data entries                    | Query the current entry sponsor, include its reserve unit, and compare with the fixture.                                  | A04                             |
| A06 | Add sponsored offer fixtures                      | Create an open offer on testnet and document expected reserve count.                                                      | Proof complete                  |
| A07 | Itemize sponsored offers                          | Use Horizon's current offers query and reconcile with the offer fixture.                                                  | A06                             |
| A08 | Add claimable-balance sponsorship fixture         | Produce a sponsored claimable balance and record its current sponsor and reserve impact.                                  | Proof complete                  |
| A09 | Itemize sponsored claimable balances              | Query current balances by sponsor and explain entries without an owner account in the account filter.                     | A08                             |
| A10 | Add scan consistency warnings                     | Make changed ledger windows, negative unit differences, truncation, and provider errors separate machine-readable states. | Proof complete                  |
| A11 | Add deterministic pagination tests                | Mock multiple Horizon pages, empty terminal page, and configured page cap without network calls.                          | Proof complete                  |
| A12 | Add exact amount boundary tests                   | Cover zero, fractional XLM, negative diagnostic values, and values above JavaScript's safe integer limit.                 | Proof complete                  |
| A13 | Decide scan storage schema                        | Record network, sponsor, ledger window, status, coverage, source and exact amounts; document indexes.                     | A10                             |
| A14 | Expose an authenticated read-only scan endpoint   | Validate sponsor address and organization access; return the report without private keys.                                 | A10, A13, authentication design |
| A15 | Add OpenAPI schemas and examples for scan results | Match implemented response fields and include partial-coverage examples.                                                  | A14                             |
| A16 | Add a sponsored liquidity-pool trustline fixture  | Record its current sponsor and reserve impact on testnet.                                                                 | Proof complete                  |
| A17 | Itemize liquidity-pool trustlines                 | Distinguish pool share entries from ordinary asset trustlines and reconcile against A16.                                  | A16                             |
| A18 | Add a stale-ledger indicator                      | Compare observation time and ledger progression against a documented threshold and expose a machine-readable status.      | A10                             |
| A19 | Add provider timeout and cancellation handling    | Bound Horizon reads, stop work on client disconnect, and return a structured retryable error.                             | Preview endpoint                |
| A20 | Add API contract verification                     | Check that the implemented preview response and error examples satisfy the OpenAPI schemas.                               | Preview endpoint                |

## Frontend work (reserveops-web)

| ID  | Proposed issue                 | Acceptance criteria                                                                                     | Prerequisite |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------ |
| W01 | Sponsor address input          | Validate a Stellar G-address and show a useful inline error. No network call on invalid input.          | A14          |
| W02 | Inventory table                | Show account/trustline type, owner, asset and exact reserve amount from a real API response.            | A14          |
| W03 | Coverage and freshness panel   | Surface ledger window, incomplete categories, truncation, and scan time without implying full coverage. | A10, A14     |
| W04 | Scan loading and retry states  | Keep previous report visibly dated and allow safe retry after a provider failure.                       | A14          |
| W05 | Accessible inventory filtering | Filter by entry type and account, with keyboard access and result count.                                | W02          |

## Wave preparation

Publish a public organization repository, a usable demo, a license, and contribution instructions before applying. The maintainer process requires repository approval before issues can enter a Wave. Start with independently mergeable issues such as A01, A04, A06, A10, A11 and A12; only open their dependent implementation issues when fixtures and review capacity exist. Reserve enough time during each Wave to review and merge work.

Sources: [maintainer workflow](https://docs.drips.network/wave/maintainers/participating-in-a-wave/), [points budgets](https://docs.drips.network/wave/maintainers/points-budgets/), [repository application limits](https://docs.drips.network/wave/maintainers/repo-application-limits/).

# NextFlow Implementation Plan

## 1. Objective
Build a production-ready NextFlow app that matches the provided specification:
- Krea-like workflow builder UI/UX
- React Flow-based visual editor
- Clerk authentication with protected workflow routes
- Trigger.dev for all LLM and FFmpeg execution
- Gemini integration (including vision support)
- Transloadit for media upload and hosted URLs
- PostgreSQL persistence via Prisma
- Node-level execution history and run timeline

## 2. Current State Summary
What exists today:
- Clerk root provider and route middleware are in place.
- Basic workflow page exists with a custom canvas prototype.
- Sidebar visuals exist, including the six quick-action labels.
- Prisma client and initial schema exist.
- TypeScript strict mode is enabled.

What is missing:
- React Flow engine and true node/edge data model.
- Trigger.dev tasks and orchestration.
- Gemini, Transloadit, and FFmpeg flow integration.
- Execution scheduler (DAG validation, parallel branches, selective runs).
- Node-level run persistence and right-panel history UI.
- API layer with Zod validation for workflow and run operations.

## 3. Target Architecture

### Frontend
- Next.js App Router pages for editor and workflow runtime views.
- React Flow for canvas, minimap, controls, and background grid.
- Zustand for editor state, undo/redo stack, selection state, and execution UI state.
- Typed node components:
  - Text
  - Upload Image
  - Upload Video
  - Run Any LLM
  - Crop Image
  - Extract Frame from Video

### Backend
- Next.js route handlers for:
  - Workflow CRUD
  - Workflow execution triggers
  - Run and node-run history retrieval
- Zod schemas for all inbound/outbound payload boundaries.
- Prisma for normalized persistence.

### Task Execution
- Trigger.dev as the mandatory execution runtime for:
  - LLM calls (Gemini)
  - Crop operations (FFmpeg)
  - Extract frame operations (FFmpeg)
- Workflow orchestration service schedules ready nodes, runs independent branches in parallel, and tracks statuses.

### Data Storage
- PostgreSQL via Prisma.
- Persisted artifacts (URLs) from Transloadit outputs.

## 4. Workstreams

## 4.1 Workstream A: Foundations and Tooling
Goal: stabilize dependencies and conventions before feature build.

Steps:
1. Install and lock required dependencies.
2. Add environment variable contract and runtime validation.
3. Create shared type definitions for nodes, edges, handles, statuses, and run scopes.
4. Define service interfaces for providers (Gemini, Transloadit, Trigger.dev).

Deliverables:
- Stable dependency graph.
- Typed contracts used by both client and server.
- Env validation that fails early with clear error messages.

## 4.2 Workstream B: Data Model and Persistence
Goal: redesign schema for workflow and history requirements.

Steps:
1. Extend Prisma schema with normalized entities.
2. Add enums and indexes for query speed and status filtering.
3. Write migration and seed checks.
4. Add repository functions for workflow save/load and run history queries.

Proposed models:
- Workflow
- WorkflowRun
- NodeRun
- Optional: WorkflowVersion and Artifact

Required fields include:
- Ownership: userId
- Run scope: full, selected, single
- Node timing: startedAt, completedAt, durationMs
- Node status: success, failed, running, skipped
- Inputs and outputs snapshots for history display

Deliverables:
- Prisma migration applied.
- Data access layer methods for all required queries.

## 4.3 Workstream C: Editor UI (React Flow)
Goal: replace custom canvas with production editor behavior.

Steps:
1. Rebuild workflow editor shell using React Flow.
2. Implement three-pane layout:
  - Left: node library and quick access
  - Center: canvas
  - Right: workflow run history panel
3. Implement node creation, drag, delete, connect, and selection.
4. Add minimap, pan/zoom, fit view, and grid background.
5. Add edge animation and visual invalid-connection blocking.

Deliverables:
- Fully functional graph editor with required navigation behavior.
- Responsive layout that preserves usability on smaller screens.

## 4.4 Workstream D: Node Components and Handle Semantics
Goal: implement exact node-level functional spec.

Node requirements:
1. Text Node
- Textarea input
- Output handle: text

2. Upload Image Node
- Upload via Transloadit
- Accept: jpg, jpeg, png, webp, gif
- Preview after upload
- Output handle: image_url

3. Upload Video Node
- Upload via Transloadit
- Accept: mp4, mov, webm, m4v
- Preview player
- Output handle: video_url

4. Run Any LLM Node
- Inputs:
  - system_prompt (optional)
  - user_message (required)
  - images (optional, multiple)
- Model selector
- Inline result rendering on node
- Output handle: output (text)

5. Crop Image Node
- Inputs:
  - image_url (required)
  - x_percent, y_percent, width_percent, height_percent (optional)
- Execution through Trigger.dev FFmpeg task
- Output handle: output (cropped image URL)

6. Extract Frame from Video Node
- Inputs:
  - video_url (required)
  - timestamp (optional, seconds or percentage)
- Execution through Trigger.dev FFmpeg task
- Output handle: output (frame image URL)

Cross-cutting node rules:
- Connected input disables corresponding manual field.
- Input validation states are visible and typed.
- Running nodes show pulsing execution glow.

Deliverables:
- Six nodes complete and connected to typed handle system.

## 4.5 Workstream E: Execution Engine and Orchestration
Goal: deterministic and scalable graph execution.

Steps:
1. Build graph validator:
- Enforce DAG (no cycles)
- Enforce type-safe connection matrix

2. Build scheduler:
- Topological dependency evaluation
- Parallel execution of independent branches
- Convergence behavior (node starts only when all direct dependencies complete)

3. Implement run modes:
- Full workflow run
- Selected nodes run
- Single node run

4. Implement lifecycle and status propagation:
- queued, running, success, failed, partial
- Node-level and run-level aggregation

5. Add cancellation and timeout handling strategy.

Deliverables:
- Production run engine with deterministic status outcomes.

## 4.6 Workstream F: Provider Integrations
Goal: connect all external services safely.

Steps:
1. Trigger.dev
- Create tasks for LLM, crop, and frame extraction.
- Add correlation IDs for run/node tracing.

2. Gemini
- Use Google Generative AI SDK in LLM task.
- Support image inputs for multimodal prompts.

3. Transloadit
- Implement signed upload flow.
- Normalize final asset URLs and metadata.

4. FFmpeg task wrappers
- Crop and extract frame command templates.
- Validate parameter ranges and formats.

Deliverables:
- End-to-end successful runs for all required node types.

## 4.7 Workstream G: API Layer and Validation
Goal: secure, typed backend interface.

Routes to build:
- Workflow CRUD routes
- Run trigger routes
- Run list and node-level details routes

Rules:
- Clerk-authenticated user scoping on all operations.
- Zod validation for request and response payloads.
- Consistent error shape and HTTP status mapping.

Deliverables:
- Stable API contracts for UI and integrations.

## 4.8 Workstream H: History UI and Observability
Goal: full run traceability in right sidebar.

Steps:
1. Build run list with metadata:
- timestamp, duration, status, scope

2. Expand run entry for node-level details:
- per-node status
- inputs used
- outputs generated
- execution time

3. Display partial runs clearly when a workflow fails mid-run.
4. Add structured logs with runId and nodeId correlation.

Deliverables:
- Reviewer-visible, persisted, explainable execution history.

## 4.9 Workstream I: Sample Workflow and Submission Readiness
Goal: satisfy acceptance checklist and demo requirements.

Steps:
1. Pre-build sample workflow with two parallel branches and one convergence LLM node.
2. Validate branch timing behavior and dependency waiting logic.
3. Verify all checklist items against real execution output.
4. Document setup and operations in README.

Deliverables:
- Demonstration workflow proving all required features.

## 5. Milestones and Sequence

Milestone 1: Foundation Complete
- Workstreams A and B complete.
- Exit criteria: schema migrated, dependencies installed, shared types finalized.

Milestone 2: Editor and Node UI Complete
- Workstreams C and D complete.
- Exit criteria: React Flow editor with all six node UIs and typed handles.

Milestone 3: Execution and Integrations Complete
- Workstreams E and F complete.
- Exit criteria: Trigger.dev-based node execution works with parallel DAG scheduling.

Milestone 4: API and History Complete
- Workstreams G and H complete.
- Exit criteria: persistent runs with node-level history in right panel.

Milestone 5: Acceptance Complete
- Workstream I complete.
- Exit criteria: checklist passes and sample workflow demo validated.

## 6. Detailed UI Build Checklist
1. Left Sidebar
- Collapsible behavior
- Search input
- Exactly 6 quick-access node buttons
- Visual active and hover states

2. Canvas
- Dot-grid background
- Minimap in bottom-right
- Zoom/pan and fit view controls
- Animated edges
- Invalid edge prevention visuals

3. Node Cards
- Handle labels and types
- Connected-input disabled state
- Loading and error indicators
- Running glow animation tied to live status

4. Right Sidebar History
- Run list badges and durations
- Expandable node tree
- Inline output previews (trimmed with expand)

5. Responsive
- Maintain functional editor on narrower desktop widths
- Preserve scroll and panel overflow usability

## 7. Detailed Backend Build Checklist
1. Auth and access control
- All workflow/run routes require authenticated user.
- User can access only own workflows and runs.

2. Workflow persistence
- Save graph snapshot (nodes and edges).
- Load workflow by id with ownership check.

3. Run persistence
- Create run record at start.
- Update node run records during execution.
- Finalize run with aggregate status.

4. Validation and safety
- Zod at route boundaries.
- Input type coercion and strict parameter checks.

5. Error handling
- Provider errors mapped to user-friendly messages.
- Internal details retained in logs.

## 8. Risks and Mitigation
1. Risk: provider integration delays.
- Mitigation: use adapter interfaces and mocked providers early.

2. Risk: execution race conditions in parallel branches.
- Mitigation: deterministic scheduler with explicit dependency counters.

3. Risk: schema churn during implementation.
- Mitigation: freeze core run and node-run schema after Milestone 1.

4. Risk: UI complexity drift from target design.
- Mitigation: weekly visual parity review against screenshots.

## 9. Definition of Done
All of the following must be true:
1. All required node types execute correctly.
2. LLM, crop, and frame extraction run through Trigger.dev tasks only.
3. DAG validation and type-safe edges are enforced.
4. Full, selected, and single run modes work and persist history.
5. Right sidebar displays persisted node-level run details.
6. Sample workflow demonstrates true parallel branches and convergence.
7. Auth and data ownership are enforced end to end.
8. README documents setup, env vars, and run instructions.

## 10. Recommended Immediate Next Steps (Start Now)
1. Implement Workstream A (dependencies, env validation, shared contracts).
2. Implement Workstream B (Prisma schema redesign and migration).
3. Begin Workstream C skeleton (React Flow editor shell with three panes).

Once these three steps are done, all remaining work can proceed in parallel with less rework.

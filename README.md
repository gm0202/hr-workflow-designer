# HR Workflow Designer (React + React Flow)

Mini prototype for building and testing HR workflows with configurable nodes, a React Flow canvas, and a mock API layer (MSW).

## Stack
- Vite + React + TypeScript
- React Flow for canvas/edges
- Zustand for state
- MSW for mock APIs

## Getting started
```bash
npm install
npm run dev
```

The MSW worker is started automatically in development (`src/main.tsx`).

## Features
- Drag-and-drop palette for Start, Task, Approval, Automation, and End nodes.
- Custom node cards rendered on a React Flow canvas with mini-map and controls.
- Node edit panel with type-specific forms (dynamic params for automation nodes).
- Validation + sandbox panel that serializes the graph, runs `/api/simulate`, and shows execution logs.
- Mock APIs:  
  - `GET /api/automations` returns sample automation actions.  
  - `POST /api/simulate` returns a mocked step-by-step log.

## Next steps if more time
- Add undo/redo history and auto-layout.
- Persist/load workflows from JSON.
- Richer validation (cycle detection, required fields) and inline node warnings.
- More expressive simulation timeline UI and per-step status icons.


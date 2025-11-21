# CourseFlow

CourseFlow is an interactive course catalog application built with Next.js, React, and ReactFlow. It allows users to visualize course dependencies for a degree program in a top-down tree diagram and view details for each course.

# Link to our codebase:
https://github.com/CCU-Computing/490-project-courseflow

# Link to our video
[Video Demo](https://coastal54-my.sharepoint.com/:v:/r/personal/akreyes_coastal_edu/Documents/490CourseFlowFinalVideo.mp4?csf=1&web=1&e=F0cdfd&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)


# Group Members:
Adrian Reyes,
Mike Szklarzewski,
Sophia McKanna,
Gavin Cartwright,
Will Mewborn,
Rodney Gilliyard

# Roles:
Architect – Mike,
Project Organizer – Gavin,
User Interface Designer – Sophia,
Quality Assurance Lead - Adrian


## Core Features:

- **Interactive Course Diagram**: Visualize courses and their prerequisite relationships.
- **Dynamic Details Panel**: Click on a course to see its description, credits, and prerequisites.
- **Responsive Design**: The application is designed to work on both desktop and mobile devices.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following software installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or later is recommended)

### Installation

1.  **Clone the repository** (or download the source code):
    ```sh
    git clone https://github.com/CCU-Computing/490-project-courseflow.git
    ```

2.  **Navigate to the project directory**:
    ```sh
    cd 490-project-courseflow/client
    ```

3.  **Install dependencies**:
    ```sh
    npm install
    ```

### Running the Application

Once the dependencies are installed, you can run the application in development mode:

```sh
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The port may vary if 9002 is already in use.

## Available Scripts

In the project directory, you can run the following commands:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the code using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Runs the TypeScript compiler to check for type errors.


## Code organization & architecture

High-level architecture

- Frontend: Next.js app located under `client/`. Pages and the React component tree render the UI.
- Visualization: `reactflow` is used for interactive prerequisite graphs (course nodes and edges).
- Styling: Tailwind CSS + shadcn/ui components for rapid, accessible UI building.
- Language: TypeScript across the app for safer refactors and type checks.

Project layout (important folders/files)

- `client/` — Next.js application root
  - `client/src/app` — top-level app entry (layouts, global styles)
  - `client/src/components` — React components (sidebar, diagram, searchbar, planner UI)
  - `client/src/components/ui` — shared UI primitives (buttons, inputs, dialogs) from shadcn patterns
  - `client/src/hooks` — custom hooks (e.g., `use-courses.ts`, `use-mobile.tsx`, `use-toast.ts`)
  - `client/src/lib` — utility functions, data parsers, and mock data helpers (`course-utils.ts`, `mock-data.ts`, `utils.ts`)
  - `client/data` — JSON course datasets used by the app (e.g., `course_data_full.json`)

- `scripts/` — supporting scripts and notebooks used to scrape/prepare course data (`scraper/`, `course_eda/`)
- `extension/` — browser extension assets (popup, content scripts) used during data collection or testing (not part of the deployed site)

Data flow / important contracts

- The app reads JSON datasets from `client/data/*.json`. Each course record contains keys like `id`, `title`, `credits`, `prerequisites`, and `termsOffered` (if available).
- UI components subscribe to course state via hooks in `src/hooks`. Planner state (courses added to semesters) is managed client-side; see `course-diagram.tsx` and `course-detail-sidebar.tsx` for integration points.

Extending the app

- To add new filters, update the search/filter component in `src/components/course-search-sidebar.tsx` and wire filter logic into `src/hooks/use-courses.ts`.
- To change graph rendering, edit `src/components/course-diagram.tsx` which builds ReactFlow nodes/edges.

---

## Backlog of user stories

The following items are planned (backlog) and not yet implemented:

- As a student, I want to drag and drop courses between semesters, so that I can reorganize my academic plan easily.
- As a student, I want warnings when I try to place a course before its prerequisites, so that I don’t make scheduling mistakes.
- As a student, I want my course planner to save automatically, so that my progress isn’t lost when I refresh or close the app.
- As a student, I want to export my full course plan as a PDF, so that I can share it or print it for advising meetings.
- As a student, I want course difficulty or workload indicators, so that I can balance my semesters more effectively.
- As a student, I want to compare multiple possible degree paths, so that I can explore alternative schedules.
- As a student, I want to receive suggestions for optimal course order, so that I follow ideal prerequisite chains.
- As a student, I want the planner to warn me if I overload a semester, so that I avoid unrealistic schedules.
- As a student, I want mobile gestures (swipe to open sidebar, tap-to-collapse planner columns), so the app feels natural on mobile.

---

## Completed user stories

The following user stories are implemented in the current codebase and were developed by the team members listed:

- As a student, I want to filter classes by subject/major so that I can quickly look through courses for my major. — Sophia
- As a student, I want to filter courses by credits so that I can properly plan my course load for the semester. — Sophia
- As a student, I want to filter courses by level so that I can quickly find courses pertaining to a specific level of study. — Sophia
- As a student, I want to add a course to my course planner, so that I can organize my schedule and plan my degree progression. — Adrian
- As a student, I want to select which semester I am adding a course to, so that I can plan my academic timeline accurately. — Adrian
- As a student, I want the system to prevent me from adding a course to a semester it is not offered in, so that I don’t accidentally plan for an impossible schedule. — Adrian
- As a student, I want the course sidebar and planner to never overlap or hide essential buttons, so that I can interact with the app without confusion. — Adrian
- As a student, I want to be able to open the website directly to my specific subject each time I open the page. — Gavin
- As a student, I want to view an accurate list of courses that includes standardized details like prerequisites and offered semesters. — Gavin
- As a student, I want to filter courses by semester, so that I only see the classes available when I plan to register. — Will
- As a student, I want to visualize course prerequisites as an interactive graph so that I can easily identify which classes I need to take before others. — Mike
- As a student, I want to toggle between light and dark themes so that I can comfortably view the course planner in low-light environments without eye strain. — Mike
- As a student, I want to filter courses by date (or days of the week) so I am presented with classes that will suit my schedule the most. — Rodney
- As a student, I want it so all the required classes under my chosen major are shown so I can better coordinate how to go through the courses. — Rodney

---

## Test plan

Use the following checklist for manual QA and tie automated tests (if added) to these scenarios.

Testing strategy

- Combination of manual exploratory testing and component-level checks. Focus on UI interactions, parsing/data correctness, and planner logic.

Core functional areas to validate

- Course search and filters (subject, credits, level, semester, days)
- Course detail sidebar (content, add-to-planner flow)
- Planner interactions (add, remove, prevent invalid adds)
- Prerequisite graph (interactive nodes/edges, zoom/pan, selection)
- Visual layout (responsive behavior and sidebar/planner overlap)

Representative test cases

- Search returns expected courses when filtered by subject/major, level, credits, or semester.
- Selecting a course opens the sidebar and displays description, credits, prerequisites and terms offered.
- Adding a course to a semester that lists the course as offered succeeds; attempting to add a course to a semester where it is not offered is prevented by the UI.
- Duplicate adds are prevented.
- Removing a course removes it immediately from the planner UI.
- The prerequisite graph renders AND/OR groups correctly and highlights selected nodes.

Additional checks

- Accessibility: keyboard navigation to open sidebar and perform add/remove actions.
- Responsive checks: verify the sidebar and planner don't overlap at common breakpoints.
- Data integrity: sample course entries compared against `client/data/*.json`.

---

## Limitations & known bugs

- Some courses are missing `termsOffered` metadata; those courses may show as unavailable for semester adds.
- Parsing gaps: a small number of scraped courses lack full metadata (description, prerequisites), which affects sidebar content.
- Music major dataset can cause the app to crash in all circumstances (needs investigation / data cleanup).
- Planner does not persist automatically (reload clears the planner) — consider adding persistence (localStorage or backend) as a next step.
- Semester years are currently hardcoded in the UI; they need updating each academic year.
- The project was developed and tested primarily on desktop. Mobile interactions require broader QA and some UI/UX tweaks (gesture support, smaller-screen layout).

---
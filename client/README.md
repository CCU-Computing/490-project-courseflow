# CourseFlow

CourseFlow is an interactive course catalog application built with Next.js, React, and ReactFlow. It allows users to visualize course dependencies for a degree program in a top-down tree diagram and view details for each course.

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
    git clone https://github.com/MikeSzklarz/CourseFlow.git
    ```

2.  **Navigate to the project directory**:
    ```sh
    cd CourseFlow
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

## Tech Stack

-   [Next.js](https://nextjs.org/) - React Framework
-   [React](https://reactjs.org/) - JavaScript Library
-   [ReactFlow](https://reactflow.dev/) - For the interactive diagram
-   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
-   [ShadCN/UI](https://ui.shadcn.com/) - UI Components


## Test Plan

1. Testing Strategy

We use a combination of manual testing, scenario-based testing, and component-level checks to verify core functionality.
Since CourseFlow is a client-side React/Next.js application with no backend API, testing focuses on:

UI interaction behavior

Course data correctness

Prerequisite logic

Course planner behavior

Error handling and edge cases

All tests simulate real user behavior and typical application workflows.

2. Core Functional Areas to Test

A. Course Search

Search by course code

Search by course title

Apply filters (semester, level, department)

Verify that results update dynamically

B. Course Detail Sidebar

Sidebar opens when a course is selected

Course description, credits, and prerequisites display correctly

Semesters offered display correctly

“Add Course” button opens selection dialog

C. Add-to-Planner Functionality

Add course to correct semester

Prevent adding courses to an invalid semester

Planner column updates immediately

D. Visual / UI & UX

Sidebar transitions and dialog animations

Colors and typography remain consistent

Course cards appear with proper layout and style

3. Test Cases
Test Case 1 — Search Returns Correct Results

Steps:

Type “CSCI” in search bar

Filter by “Fall”

Expected Outcome:
Only CSCI courses offered in the Fall appear.

Test Case 2 — View Course Details

Steps:

Select a course from search or diagram

Sidebar opens

Expected Outcome:
Course description, credits, prerequisites, and semesters offered all display correctly.

Test Case 3 — Add Course (Valid Semester)

Steps:

Open course detail sidebar

Click Add Course

Select a semester that the course is offered in

Click Add

Expected Outcome:
Course appears in the selected semester column.

Test Case 4 — Add Course (Invalid Semester)

Steps:

Try and select a semester that the course is not offered in

Expected Outcome:
The invalid semester is "grayed out' in the select semester dopdown options and can not be selected.

Course is not added.

Test Case 5 — Prevent Duplicate Courses

Steps:

Add a course to a semester

Attempt to add the same course again

Expected Outcome:
Course is not added again and the semester only shows the already added course from before.

Test Case 6 — Prerequisite Rendering

Steps:

Open a course with AND/OR prerequisites

Inspect prerequisite chips

Expected Outcome:

AND groups appear correctly

OR groups display multiple alternatives

Course IDs and titles match dataset

Test Case 7 — Delete/Remove Course

Steps:

Add a course

Click the red x button next to it

Expected Outcome:
Course disappears instantly from the planner.

## Description of limitations and known issues/bugs

Some courses do not include “Terms Offered,” so fallbacks treat them as unavailable every semester.

Parsing of courses struggles at times, with some courses not really having any information from CCU to be displayed.

When choosing the Music major, the program crashes and is unusable.

Program does not have a user's class history so this limits how far it can work with prerequisites and the how the course planner handles them.

The years of the semesters are currently hardcoded in and would have to be manually be changed as new school years begin.

Program was only tested and developed on desktop, so performance on other kinds of devices has not been explored.
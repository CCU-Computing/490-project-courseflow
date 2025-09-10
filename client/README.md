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

# 490-project-courseflow
490-project-courseflow created by GitHub Classroom

## Prerequisites

Ensure the following are installed on your system:

1. **Docker** - Docker is a platform that allows you to build, run, and manage containers. Containers are lightweight, portable environments that include everything needed to run an application (e.g., code, runtime, libraries, etc.).
   - [Download Docker](https://www.docker.com/)
   - Verify installation:
     ```bash
     docker --version
     ```

2. **Docker Compose** - A tool for defining and running multi-container Docker applications. It comes bundled with Docker Desktop or can be installed separately.
   - Verify installation:
     ```bash
     docker compose version
     ```

### **Do I Need Node.js Installed?**
No, you do not need Node.js installed on your host machine. Docker containers are self-contained environments that include everything they need to run, including the Node.js runtime. The `Dockerfile` for this project specifies a Node.js base image (e.g., `node:20-alpine`), which ensures that Node.js is installed inside the container. This means:
- You only need Docker and Docker Compose installed on your host machine.
- Node.js will be installed and used inside the container.

## Setting Up the Project

Follow these steps to set up the project:

1. **Clone the Repository**  
    ```bash
    git clone https://github.com/CCU-Computing/490-project-courseflow.git
    cd 490-project-courseflow
    ```

2. **Set Up Environment Variables**  
    - Ensure the `.env` file is present in the `server` folder with the required environment variables configured.
    - Example `.env` file:
      ```env
      MONGO_URI=mongodb://admin:admin@mongodb:27017
      PORT=5001
      ```

3. **Build and Start the Docker Containers**  
    Use Docker Compose to build and start the containers:
    ```bash
    docker compose up --build
    ```
    This will:
    - Start the MongoDB database.
    - Build and run the backend server.
    - Build and run the frontend application.

4. **Access the Application**  
    - **Frontend**: Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
    - **Backend**: The backend API is available at [http://localhost:5001](http://localhost:5001).

5. **Verify the Backend and Database**  
    - Check if the backend and database are working by making a request to the `/api/courses` endpoint:
      ```bash
      curl http://localhost:5001/api/courses
      ```
    - You should see a list of courses if the database is properly seeded.

## Notes

- The backend server is configured to run on port `5001` internally and is exposed on the same port externally.
- The `seed.js` script is automatically executed when the backend container starts, ensuring the database is populated with initial data.
- If you need to reset the database, you can remove the Docker volume:
  ```bash
  docker compose down -v
  ```
  Then restart the containers:
  ```bash
  docker compose up --build
  ```

Your project should now be fully set up and running!
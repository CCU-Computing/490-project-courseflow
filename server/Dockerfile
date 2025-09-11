# Use a compatible Node.js version
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 5001

# Set environment variables for MongoDB connection
ENV MONGO_URI=mongodb://admin:admin@mongodb:27017

# Run the seed script before starting the server
CMD ["sh", "-c", "node scripts/seed.js && npm start"]
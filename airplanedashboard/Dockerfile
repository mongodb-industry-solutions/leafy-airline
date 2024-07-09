# Use the official Node.js image with the required version.
FROM node:18.17.0

# Set the working directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code to the working directory.
COPY . .

# Build the app.
RUN npm run build

# Environment variable for port.
ENV PORT=8080

# Tell Docker about the port we'll run on.
EXPOSE 8080

# Run the web service on container startup.
CMD ["npm", "start"]

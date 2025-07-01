# Use official Node.js LTS Alpine image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose port your app listens on (3000 by default)
EXPOSE 3000

# Command to run your app
CMD ["node", "app.js"]


# Test3

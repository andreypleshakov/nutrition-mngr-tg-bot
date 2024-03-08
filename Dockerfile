FROM node:20.11.1-alpine

# Set the working directory inside your Docker image
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy the package.json and pnpm-lock.yaml (or package-lock.json if you're using npm) file into the working directory
COPY package.json pnpm-lock.yaml ./

# Install your application's dependencies
RUN pnpm install

# Copy the rest of your application's source code into the working directory
COPY . .

# Command to run your app (adjust the file name as necessary)
CMD [ "pnpm", "run", "start" ]

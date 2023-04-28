# Define base image for build-stage
FROM node:lts-alpine as BUILDER

# Required for turborepo
# RUN apk add --no-cache libc6-compat
# RUN apk update

# Set working directory
ARG CWD=/opt/tsradio
WORKDIR ${CWD}

# Copy root package.json
COPY . .

# Install package's deps
RUN yarn install
# Build api
RUN yarn build

# Build stage completed, begin with new base image
# Remember, copy previously built files into the new image
FROM node:lts-alpine AS DEPLOY

# Set workdir
ARG CWD=/opt/tsradio
WORKDIR ${CWD}

# Create volume to persist instance info
VOLUME [ "/data" ]

# Copy compile output of backend application
COPY --from=BUILDER ${CWD}/dist ${CWD}/

# Copy root package.json because it contains workspace
# configuration to install production deps
COPY package.json package.json

# Set env variables that can be utilized by the backend
# DOCKERIZED is used to register all volumes mounted in the /mnt/ folder
# as a mount for tsradio.
ENV NODE_ENV=production
ENV DOCKERIZED=true

# Install only production deps
RUN yarn install

EXPOSE 3002

ENTRYPOINT ["node", "main.js"]
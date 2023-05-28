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

# Copy compile output of backend application
COPY --from=BUILDER ${CWD}/dist ${CWD}/

# Copy root package.json because it contains workspace
# configuration to install production deps
COPY package.json package.json

# Set env variables that can be utilized by the backend
ENV NODE_ENV=production
ENV DOCKERIZED=true

# Install only production deps
RUN yarn install --production=true --ignore-optional

EXPOSE 3002

ENTRYPOINT ["node", "main.js"]
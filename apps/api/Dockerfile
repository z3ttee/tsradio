# # Define base image for build-stage
# FROM node:lts-alpine as BUILDER

# # Required for turborepo
# RUN apk add --no-cache libc6-compat
# RUN apk update

# # Set working directory
# ARG CWD=/opt/tsradio
# WORKDIR ${CWD}

# # Copy root package.json
# COPY . .

# # Install package's deps
# RUN yarn install
# # Build api
# RUN yarn build

# # Build stage completed, begin with new base image
# # Remember, copy previously built files into the new image
# FROM node:lts-alpine AS DEPLOY

# # Set workdir
# ARG CWD=/opt/tsradio
# WORKDIR ${CWD}

# # Copy compile output of backend application
# COPY --from=BUILDER ${CWD}/dist ${CWD}/

# # Copy root package.json because it contains workspace
# # configuration to install production deps
# COPY package.json package.json

# # Set env variables that can be utilized by the backend
# ENV NODE_ENV=production
# ENV DOCKERIZED=true

# # Install only production deps
# RUN yarn install --production=true --ignore-optional

# EXPOSE 3002

# ENTRYPOINT ["node", "main.js"]

FROM node:lts-alpine AS base

FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo run build --filter=api...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs
COPY --from=installer /app .

ENV PRODUCTION=true
ENV DOCKERIZED=true

CMD node apps/api/dist/index.js
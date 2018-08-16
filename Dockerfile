ARG node_version=8-alpine

# Create base image with project files
FROM node:${node_version} as base

RUN apk add --update git tini

COPY . /app
WORKDIR /app

# Install dependencies
FROM base as install
RUN npm install 

# Create build image
FROM install as build
RUN npm run build

# Create release
FROM build as release
EXPOSE 17290
ENTRYPOINT [ "/sbin/tini" ]
CMD [ "npm", "start", "--", "--host=0.0.0.0" ]

# Thanks for using BPMN-Studio Docker image
LABEL de.5minds.version="0.0.1" \
      de.5minds.release-date="2018-08-13" \
      vendor="5Minds IT-Solutions GmbH & Co. KG" \
      maintainer="Dominik Kaminski"

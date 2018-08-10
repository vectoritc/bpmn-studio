ARG node_version=8-alpine

FROM node:${node_version} as base

RUN apk add --update git tini

COPY . /app
WORKDIR /app

RUN npm install 

FROM base as build

RUN npm run build

FROM build as release

EXPOSE 17290
ENTRYPOINT [ "/sbin/tini" ]
CMD [ "npm", "start", "--", "--host=0.0.0.0" ]

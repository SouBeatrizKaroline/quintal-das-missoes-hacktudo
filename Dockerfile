FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node server.js ./
COPY --chown=node:node src/http.js ./src/http.js
COPY --chown=node:node public ./public
ENV GAME_HOST=0.0.0.0 PORT=3000
USER node
EXPOSE 3000
CMD ["node", "--experimental-default-type=module", "server.js"]

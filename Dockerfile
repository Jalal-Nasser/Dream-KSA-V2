FROM node:20-alpine

WORKDIR /app

# Install only backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend ./backend

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app/backend
EXPOSE 8080

CMD ["node", "server.js"]

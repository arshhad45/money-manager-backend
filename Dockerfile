FROM node:20-alpine
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1
CMD ["node", "index.js"]
```

Also create `.dockerignore` in backend root:
```
node_modules
.env
.git
*.log
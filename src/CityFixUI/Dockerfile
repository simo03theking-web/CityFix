# Build stage
FROM node:18-alpine AS build

ENV VITE_API_BASE_URL=http://localhost:8087
ENV VITE_MEDIA_BASE_URL=http://localhost:8004

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

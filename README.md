# lowcloud Frontend Demo

A modern Vue.js 3 application demonstrating API data consumption with a beautiful UI built using shadcn-vue and Tailwind CSS.

## Features

- 🚀 Vue 3 with Composition API
- 📱 Responsive Design with Tailwind CSS
- 🎨 Modern UI Components (shadcn-vue)
- 🔄 Vue Router for Navigation
- 📊 API Data Display (Users, Products, Orders)
- 🔧 TypeScript Support
- ⚡ Vite for Fast Development

## Prerequisites

- Node.js ^20.19.0 || >=22.12.0
- npm

## Environment Setup

1. Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

> **Note:**
>
> - The trailing slash is optional (automatically removed)
> - CORS must be configured on the API server
> - Both formats work: `https://api.com` or `https://api.com/`

### Alternative Configuration Methods

**Docker:**

```bash
docker run -e VITE_API_BASE_URL=https://api.yourdomain.com your-app
```

**Build-time:**

```bash
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

**Kubernetes/Helm:**

```yaml
env:
  - name: VITE_API_BASE_URL
    value: 'https://api.yourdomain.com'
```

## API Endpoints

The application consumes the following endpoints:

- `GET /api/users` - Fetch all users
- `GET /api/products` - Fetch all products
- `GET /api/orders` - Fetch all orders

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)

```sh
npm run format
```

## Project Structure

```
src/
├── assets/          # Global styles (Tailwind CSS)
├── components/      # Reusable components
│   └── ui/         # shadcn-vue UI components
├── views/          # Page components
├── router/         # Vue Router configuration
├── services/       # API service layer
│   ├── api.ts     # API client
│   └── types.ts   # TypeScript interfaces
└── lib/           # Utility functions
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)

## Deployment

### podman

Build and run with podman:

```bash
# Build with API URL
podman build \
  --name lowcloud-frontend \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  -t lowcloud-frontend-demo .

# Run container
podman run -d -p 8080:80 lowcloud-frontend-demo
```

### Example for different environments:

```bash
# Staging
podman build \
  --build-arg VITE_API_BASE_URL=https://api-staging.yourdomain.com \
  -t lowcloud-frontend-demo:staging .

# Production
podman build \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  -t lowcloud-frontend-demo:production .
```

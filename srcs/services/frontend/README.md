# frontend

## Description

`frontend` is the single-page application loaded by the browser. It is the only service the user's browser talks to directly, served as static files through nginx.

It never reaches the backend services directly. Every call is a `fetch` on a relative path, resolved by nginx which reverse-proxies it to the right service over the internal Docker network:

The session is carried by `httpOnly` cookies set by `users_service`, so the JavaScript never reads or stores the token itself.


## Stack

### The engine

The app is built and served by **Node.js**, which runs the JavaScript tooling before anything reaches the browser.

Two different pieces of JS are involved, and they don't run in the same place:

Two modes:

- **Development** [`make dev`, `Dockerfile.dev`]: all dependencies are installed. Node runs `vite`, the dev server, which serves the app on port `5173` with Hot Reload: when a file changes, Vite pushes the update to the browser over a web-socket without a full reload.

- **Production** [`make up`, `Dockerfile`]: the image is built in two stages. The **builder** installs the dependencies, type-checks and bundles the app into a `dist/` directory (`npm run build`). The **runner** ii a image that copies only `dist/` and serves it as static files on port `80`. 

### Vite

The build tool the app is built on. Browsers don't understand JSX or TypeScript natively, so Vite does the work in between:

- **Transforms the code**: converts JSX (React) and TypeScript into plain JavaScript the browser can run.
- **Resolves modules**: the packages pulled from `node_modules` are re-served in a format the browser can import.
- **Dev server**: runs a local server that serves the app with hot-reload over a web-socket.


### React

The UI library. The app is written as a tree of components that describe what the UI looks like from their state and props.

- `src/main.tsx`: the entry point, mounts the app into the page.
- `src/components/`: the reusable pieces.


### Tailwind

The styling. **tailwindcss** provides utility classes applied directly in the JSX `className`, so the styles live next to the markup instead of in separate CSS files. It is wired in through the `@tailwindcss/vite` plugin and pulled once in `src/styles.css`.


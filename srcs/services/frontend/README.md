# Frontend

## Stack

A Vite + React app written in TypeScript.

- **Node.js**: a JavaScript runtime that runs JS outside the browser, on our machines and inside the Docker containers. 
- **Vite**: provide a dev server with hot-reload, transpile the code from TypeScript to JavaScript.
- **React**: the UI library. The app is written as a tree of components that describe what the UI looks like based on their state/props.
- **TypeScript**: a superset of JavaScript that adds static types, checked at build time to catch mistakes before they reach the browser.
- **ESLint**: lints the code to catch common mistakes and enforce consistent style.

### Why a runtime, and not just the browser

Two different pieces of JS are involved here, and they don't run in the same place:

- **The app's code (React librairy)** can run in the browser, like any web page.
- **But the tools that build that app (npm, Vite, tsc, eslint)** have to run before anything reaches the browser, inside the Docker container.


### Why Vite

- **Transforms the code**: browsers don't understand JSX (React) or TypeScript natively, so Vite has to convert that in JavaScript.
- **Resolves modules**: modules used into code are served into node_modules file, Vite serve it in a browser format.
- **Dev server with Hot Module Replacement**: Vite can run a local server that serves the app with hot-reload via web-socket. When a file change, Vite pushes that update instantly.


### Dependencies vs devDependencies

**package.json** splits packages into two lists, **dependencies** and **devDependencies**. 

- **dependencies**: code the app actually needs at runtime, in the browser. (prod)
- **devDependencies**: tools only needed while developing/building the app on our machines. (dev)

### Docker multi-stage
Because we have **dependencies** and **devDependancies** the **Dockerfile** builds the image in two stages: (see: Dockerfile)

1. **builder**: installs the npm dependencies, copies the source, and runs **devTools**
2. **runner**: copies only **/app/dist** from the **builder** stage and serves it as static files on port 80. Node, npm, and all the dev dependencies stay out of the final image, which keeps it small.

## Working locally

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server with hot reload
npm run build     # type-check (tsc -b) then bundle for production into dist/
npm run preview   # serve the production build locally to sanity-check it
npm run lint      # run eslint
```

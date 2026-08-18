# frontend

## What it does

`frontend` is the single-page app the browser loads. It covers login, signup, 2FA, privacy and terms, then the chat: conversations, friends, profile, API keys and the admin panel.

Nginx serves it on `/`. All `fetch` calls use relative paths (`/auth`, `/users`, `/friends`, `/chat`, `/api`). Nginx (or the Vite proxy in dev) forwards them. Session cookies are `httpOnly`. `src/api.ts` retries once on 401 via `GET /auth/session`, then fires `auth-lost`.

Code lives in `app/src/`. Screens are under `auth/` and `chat/`. Shared pieces are in `components/` and `hooks/`.

## Stack

- **Node.js**: build tools in the container, Vite in dev
- **Vite**: TypeScript and JSX to JS, hot reload in dev, bundle in prod
- **React**: UI as components
- **Tailwind**: utility classes in `className`
- **Motion**: sidebar view transitions
- **qrcode**: TOTP QR in the user menu
- **TypeScript**: types checked at build (`tsc -b`)

## Stack in detail

### Node.js

In dev (`make dev`) the image runs `npm run dev` (Vite on port `5173`). In prod (`make up`) a two-stage image builds `dist/` then an nginx image serves those files on port `80`. The browser never runs Node.

### Vite

`@vitejs/plugin-react` and `@tailwindcss/vite` transform the sources. In dev, Vite proxies `/api` and `/auth` to the backend. Other prefixes go through nginx. `npm run build` type-checks then writes the bundle to `dist/`.

### React

`src/main.tsx` mounts `App`. `App` calls `GET /auth/session`. Logged out it renders `Auth`. Logged in it renders `Chat`. State is local hooks plus the chat WebSocket.

### Tailwind

`src/styles.css` imports Tailwind and defines a few shared classes (`btn-primary`, `search-input`). Colors sit in `@theme`.

### Motion

`motion/react` animates the sidebar when the view changes (`HomeView`, `SearchView`, `UserMenuView`).

### qrcode

`TwoFactorSection` turns the `otpauth://` URL from `POST /auth/2fa/setup` into a QR image.

### TypeScript

`npm run build` runs `tsc -b` then Vite. `npm run lint` runs ESLint.

## Modules

### auth

Login, signup, 2FA and the legal pages.

| Screen | What it does | How |
|---|---|---|
| `LoginView` | `POST /auth/login`, opens 2FA if needed | `/` while logged out |
| `SignupView` | `POST /auth/register` | link on the login card |
| `TwoFactorView` | `POST /auth/2fa/verify` | after login when 2FA is on |
| `LegalView` | privacy policy and terms | links on the auth card |

### chat

Sidebar plus conversation. Friends, create channel / group / discussion, profile, API key, 2FA setup, password, admin user list. Live updates on `wss://…/chat/ws`.

| Piece | What it does | How |
|---|---|---|
| `Sidebar` | conversations, friends, search, create, user menu | left column |
| `ChatWindow` | messages, send, edit, delete, file upload | center |
| `InfoPanel` | members, roles, write mode, channel avatar | channel header |
| `AdminPanel` | list / edit / delete users | user menu, admin only |
| `ApiKeySection` | create, renew, revoke `/api/api_keys` | user menu |
| `TwoFactorSection` | setup, enable, disable 2FA | user menu |

### hooks

`useChannel`, `useMessage` and `useFriends` call the HTTP APIs. `useChatSocket` plus `useReconnectingSocket` keep the WebSocket up (reconnect after 3s, again when the tab is visible). `presence` holds the online user ids.

### components

`TextField` and `TextAreaField` used by auth and the user menu.

## Commands

Scripts for this service. Open the app at `https://localhost` (cert is self-signed).

| Command | What it does | How |
|---|---|---|
| `npm run dev` | Vite with hot reload | `app/` or `make dev` |
| `npm run build` | type-check and write `dist/` | `app/` |
| `npm run preview` | serve the prod bundle locally | `app/` |
| `npm run lint` | ESLint | `app/` |

import { createContext, useContext } from 'react'

// Live overlay of user identity, patched by websocket.
// undefined on a field = no live update yet, keep the fetch fallback.
// null on avatarUrl = avatar was explicitly removed.
export type UserIdentity = {
	avatarUrl?: string | null
	pseudo?: string | null
}

// Values live in useChatSocket, provided here via context so deeply nested components
// can read them without prop-drilling through Chat.tsx
const OnlineUsersContext = createContext<Set<number>>(new Set())
const UserAvatarsContext = createContext<Map<number, UserIdentity>>(new Map())

export const UserAvatarsProvider = UserAvatarsContext.Provider

export const OnlineUsersProvider = OnlineUsersContext.Provider

export function useUserAvatars(): Map<number, UserIdentity> {
	return useContext(UserAvatarsContext)
}

export function useOnlineUsers(): Set<number> {
	return useContext(OnlineUsersContext)
}

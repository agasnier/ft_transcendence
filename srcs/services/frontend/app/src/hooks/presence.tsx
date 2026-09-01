import { createContext, useContext } from 'react'

// Values live in useChatSocket, provided here via context so deeply nested components
// can read them without prop-drilling through Chat.tsx
const OnlineUsersContext = createContext<Set<number>>(new Set())
const UserAvatarsContext = createContext<Map<number, string | null>>(new Map())

export const UserAvatarsProvider = UserAvatarsContext.Provider

export const OnlineUsersProvider = OnlineUsersContext.Provider

export function useUserAvatars(): Map<number, string | null> {
	return useContext(UserAvatarsContext)
}

export function useOnlineUsers(): Set<number> {
	return useContext(OnlineUsersContext)
}

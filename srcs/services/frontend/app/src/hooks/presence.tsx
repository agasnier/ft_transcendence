import { createContext, useContext } from 'react'

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

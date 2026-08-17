import { createContext, useContext } from 'react'

const OnlineUsersContext = createContext<Set<number>>(new Set())

export const OnlineUsersProvider = OnlineUsersContext.Provider

export function useOnlineUsers(): Set<number> {
	return useContext(OnlineUsersContext)
}

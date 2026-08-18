const nativeFetch = window.fetch.bind(window)

const AUTH_URLS_WITHOUT_REFRESH = [
	'/auth/login',
	'/auth/register',
	'/auth/session',
	'/auth/logout',
	'/auth/2fa/verify',
]

let refreshInFlight: Promise<boolean> | null = null

function requestUrl(input: RequestInfo | URL): string {
	if (typeof input === 'string')
		return input
	if (input instanceof URL)
		return input.href
	return input.url
}

function shouldRefresh(url: string): boolean {
	return !AUTH_URLS_WITHOUT_REFRESH.some((path) => url.includes(path))
}

async function refreshSession(): Promise<boolean> {
	if (refreshInFlight)
		return refreshInFlight

	refreshInFlight = nativeFetch('/auth/session')
		.then((res) => res.ok)
		.finally(() => {
			refreshInFlight = null
		})

	return refreshInFlight
}

async function fetchWithSessionRefresh(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const res = await nativeFetch(input, init)
	if (res.status !== 401 || !shouldRefresh(requestUrl(input)))
		return res

	const sessionOk = await refreshSession()
	if (sessionOk)
		return nativeFetch(input, init)

	window.dispatchEvent(new Event('auth-lost'))
	return res
}

window.fetch = fetchWithSessionRefresh

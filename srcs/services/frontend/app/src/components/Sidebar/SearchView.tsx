function SearchView({ searchQuery, setSearchQuery, setView }: any) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => {
                    setSearchQuery('')
                    setView({ kind: 'home' })
                }}
                className="w-12 h-12 bg-white text-2xl text-gray-500 leading-none flex items-center justify-center hover:bg-gray-200 rounded-full">
                ⟲
            </button>
            <div className="relative flex-1 min-w-0">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍︎ Rechercher"
                    autoFocus
                    className="w-full text-lg rounded-full pl-3 pr-9 py-2 border border-transparent hover:border hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white bg-gray-100"
                />
                {searchQuery !== '' && (
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100">
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default SearchView
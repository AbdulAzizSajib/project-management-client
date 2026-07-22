import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, Loader2Icon, FolderIcon, SquareCheckIcon } from "lucide-react";
import { globalSearch } from "../services/searchService";

/*
  Navbar er global search — debounce kore backend e query pathay,
  dropdown e project + task result dekhay, click korle navigate kore।
*/
const GlobalSearch = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ projects: [], tasks: [] });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);

    // debounce: user thamle 350ms por search kori (protiti keystroke e na)
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults({ projects: [], tasks: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const data = await globalSearch(q);
                setResults(data);
            } catch {
                setResults({ projects: [], tasks: [] });
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [query]);

    // baire click korle dropdown bondho
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const goToProject = (projectId) => {
        setOpen(false);
        setQuery("");
        navigate(`/projectsDetail?id=${projectId}`);
    };

    const goToTask = (task) => {
        setOpen(false);
        setQuery("");
        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`);
    };

    const hasResults = results.projects.length > 0 || results.tasks.length > 0;

    return (
        <div ref={boxRef} className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Search projects, tasks..."
                className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
            />

            {/* Dropdown — query 2+ char hole dekhai */}
            {open && query.trim().length >= 2 && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500 dark:text-zinc-400">
                            <Loader2Icon className="size-4 animate-spin" /> Searching...
                        </div>
                    ) : !hasResults ? (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-zinc-400">
                            No results found
                        </div>
                    ) : (
                        <div className="py-1">
                            {results.projects.length > 0 && (
                                <>
                                    <div className="px-3 py-1 text-xs uppercase text-gray-400 dark:text-zinc-500">Projects</div>
                                    {results.projects.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => goToProject(p.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        >
                                            <FolderIcon className="size-4 text-primary-500 shrink-0" />
                                            <span className="truncate">{p.name}</span>
                                            <span className="ml-auto text-xs text-gray-400 dark:text-zinc-500">{p.status}</span>
                                        </button>
                                    ))}
                                </>
                            )}

                            {results.tasks.length > 0 && (
                                <>
                                    <div className="px-3 py-1 mt-1 text-xs uppercase text-gray-400 dark:text-zinc-500">Tasks</div>
                                    {results.tasks.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => goToTask(t)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        >
                                            <SquareCheckIcon className="size-4 text-emerald-500 shrink-0" />
                                            <span className="truncate">{t.title}</span>
                                            <span className="ml-auto text-xs text-gray-400 dark:text-zinc-500 truncate max-w-[40%]">{t.project?.name}</span>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;

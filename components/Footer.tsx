import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative z-10 w-full border-t border-white/5 mt-16 py-8 px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Left: branding */}
                <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-white">
                        Agent{' '}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Jury
                        </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                        Built for{' '}
                        <span className="text-purple-500 font-medium">Monad Blitz Hackathon</span>
                    </p>
                </div>

                {/* Center: team */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Built with ⚡ by</span>
                    <span className="text-slate-400 font-medium">Agent Jury Team</span>
                </div>

                {/* Right: links */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/history"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
                    >
                        History
                    </Link>
                    <a
                        href="https://github.com/muhammetgumus55/agent-jury"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150 flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </a>
                    <a
                        href="https://monad.xyz"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-purple-400 transition-colors duration-150"
                    >
                        Monad
                    </a>
                </div>

            </div>
        </footer>
    );
}

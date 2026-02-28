import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="relative min-h-screen flex items-center justify-center px-4">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-25"
                    style={{
                        background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
            </div>

            <div className="text-center animate-[fadeSlideUp_0.5s_ease_both]">
                {/* 404 number */}
                <p className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter">
                    <span className="bg-gradient-to-br from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                        404
                    </span>
                </p>

                <h1 className="text-xl md:text-2xl font-bold text-white mb-3 -mt-4">
                    Page not found
                </h1>
                <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">
                    The jury couldn't find this page. Maybe it was rejected during evaluation.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                    >
                        ← Back to Jury
                    </Link>
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 glass hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                        View History
                    </Link>
                </div>
            </div>
        </main>
    );
}

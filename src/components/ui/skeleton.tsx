export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`animate-pulse bg-slate-800/50 rounded ${className}`} style={style}></div>
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card rounded-3xl p-8 border-slate-800">
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                </div>
            ))}
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="glass-card rounded-3xl p-6 border-slate-800">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-8 w-32" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass-card rounded-3xl p-8 border-slate-800">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-3 flex-1" style={{ width: `${Math.random() * 50 + 50}%` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

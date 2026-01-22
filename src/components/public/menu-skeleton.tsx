export function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden animate-pulse">
          <div className="h-56 w-full bg-slate-800" />
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-6 w-1/2 bg-slate-800 rounded-lg" />
              <div className="h-6 w-1/4 bg-slate-800 rounded-lg" />
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-800 rounded-lg" />
            <div className="pt-4 flex justify-between items-center">
              <div className="h-4 w-1/3 bg-slate-800 rounded-lg" />
              <div className="h-10 w-24 bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

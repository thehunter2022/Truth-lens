export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">

      {/* Main Background */}

      <div className="absolute inset-0 bg-[#020617]" />

      {/* Blue */}

      <div className="absolute -top-44 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[150px]" />

      {/* Cyan */}

      <div className="absolute top-60 right-0 w-[450px] h-[450px] rounded-full bg-cyan-500/20 blur-[150px]" />

      {/* Purple */}

      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[170px]" />

      {/* Grid */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Gradient */}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />

    </div>
  );
}
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/health", { signal: ctrl.signal });
        if (import.meta.env.DEV) console.log("health:", res.ok);
      } catch (err) {
        if (err?.name !== "AbortError") console.log("health error:", err);
      }
    })();

    return () => ctrl.abort();
  }, []);

  return (
    <div>
      <h1 className="heading center">Home</h1>
    </div>
  );
};

export default Home;

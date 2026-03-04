import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    const getHealth = async () => {
      const url = "http://localhost:5000/api/health";
      const res = await fetch(url);
      console.log(res.ok);
    };
    getHealth();
  }, []);
  return (
    <div>
      <h1 className="heading center">Home</h1>
    </div>
  );
};

export default Home;

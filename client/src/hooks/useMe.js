import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchMe = async () => {
  const res = await api.get("/api/auth/me");
  return res.data?.data ?? res.data;
};

const useMe = () => {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
    staleTime: 60 * 1000,
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) localStorage.removeItem("token");
    },
  });
};

export default useMe;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/api/projects")).data.data,
  });

const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post("/api/projects", payload)).data.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};

const useProject = (id) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await api.get(`/api/projects/${id}`)).data.data,
    enabled: Boolean(id),
  });

const useUploadProjectFiles = (id, route) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      return (
        await api.post(`/api/projects/${id}/upload/${route}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export { useProjects, useCreateProject, useProject, useUploadProjectFiles };

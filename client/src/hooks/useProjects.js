import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
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
  const [uploadUi, setUploadUi] = useState({
    progress: 0,
    stage: "idle",
    message: "",
    fileCount: 0,
    uploadedCount: 0,
  });

  const label = route === "originals" ? "originals" : "finals";

  const resetUploadUi = useCallback(() => {
    setUploadUi({
      progress: 0,
      stage: "idle",
      message: "",
      fileCount: 0,
      uploadedCount: 0,
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      return (
        await api.post(`/api/projects/${id}/upload/${route}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            setUploadUi((current) => {
              if (!event.total) {
                return {
                  ...current,
                  stage: "uploading",
                  message: `Uploading ${label}...`,
                };
              }

              const progress = Math.min(
                100,
                Math.round((event.loaded * 100) / event.total),
              );

              if (progress >= 100) {
                return {
                  ...current,
                  progress: 100,
                  stage: "processing",
                  message: `Processing ${label}...`,
                };
              }

              return {
                ...current,
                progress,
                stage: "uploading",
                message: `Uploading ${label}...`,
              };
            });
          },
        })
      ).data.data;
    },
    onMutate: (files) => {
      setUploadUi({
        progress: 0,
        stage: "uploading",
        message: `Uploading ${label}...`,
        fileCount: files.length,
        uploadedCount: 0,
      });
    },
    onSuccess: (response, files) => {
      const uploadedCount = Array.isArray(response)
        ? response.length
        : response?.uploadedCount || files?.length || 0;

      setUploadUi((current) => ({
        ...current,
        progress: 100,
        stage: "success",
        uploadedCount,
        message:
          uploadedCount > 0
            ? `${label === "originals" ? "Originals" : "Finals"} uploaded successfully (${uploadedCount} file${uploadedCount === 1 ? "" : "s"})`
            : `${label === "originals" ? "Originals" : "Finals"} uploaded successfully`,
      }));

      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (uploadError) => {
      setUploadUi((current) => ({
        ...current,
        stage: "error",
        message:
          uploadError?.response?.data?.message ||
          `Unable to upload ${label}. Please try again.`,
      }));
    },
  });

  return {
    ...mutation,
    progress: uploadUi.progress,
    stage: uploadUi.stage,
    message: uploadUi.message,
    fileCount: uploadUi.fileCount,
    uploadedCount: uploadUi.uploadedCount,
    resetUploadUi,
  };
};

const useReopenSelection = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      (await api.patch(`/api/projects/${id}/reopen-selection`)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

const useDeleteProject = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await api.delete(`/api/projects/${id}`)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });
};

export {
  useProjects,
  useCreateProject,
  useProject,
  useUploadProjectFiles,
  useReopenSelection,
  useDeleteProject,
};

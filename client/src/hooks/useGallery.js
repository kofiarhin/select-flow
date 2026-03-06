import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const useGallery = (token) =>
  useQuery({
    queryKey: ["gallery", token],
    queryFn: async () => (await api.get(`/api/gallery/${token}`)).data.data,
    enabled: Boolean(token),
  });

const useSaveSelection = (token) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) =>
      (
        await api.post(`/api/gallery/${token}/selection`, {
          selectedImageIds: ids,
        })
      ).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", token] });
    },
  });
};

export { useGallery, useSaveSelection };

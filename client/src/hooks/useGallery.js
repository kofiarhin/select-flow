import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';

const useGallery = (token) => useQuery({ queryKey: ['gallery', token], queryFn: async () => (await api.get(`/api/gallery/${token}`)).data.data });
const useSaveSelection = (token) => useMutation({ mutationFn: async (ids) => (await api.post(`/api/gallery/${token}/selection`, { selectedImageIds: ids })).data.data });

export { useGallery, useSaveSelection };

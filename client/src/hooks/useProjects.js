import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/api/projects')).data.data });

const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (payload) => (await api.post('/api/projects', payload)).data.data, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) });
};

const useProject = (id) => useQuery({ queryKey: ['project', id], queryFn: async () => (await api.get(`/api/projects/${id}`)).data.data });

export { useProjects, useCreateProject, useProject };

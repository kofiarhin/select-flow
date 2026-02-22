import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

const useRegister = () => useMutation({ mutationFn: async (payload) => (await api.post('/api/auth/register', payload)).data.data });
const useLogin = () => useMutation({ mutationFn: async (payload) => (await api.post('/api/auth/login', payload)).data.data });

export { useRegister, useLogin };

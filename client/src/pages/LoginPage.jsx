import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    const data = await login.mutateAsync(form);
    localStorage.setItem('token', data.token);
    navigate('/dashboard');
  };
  return <form className='auth-form' onSubmit={submit}><h1>Login</h1><input placeholder='email' value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input type='password' placeholder='password' value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/><button>Login</button><Link to='/register'>Register</Link></form>;
};

export default LoginPage;

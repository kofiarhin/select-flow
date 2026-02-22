import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateProject, useProjects } from '../hooks/useProjects';

const DashboardPage = () => {
  const { data = [] } = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  return <div className='page'><h1>Projects</h1><div className='row'><input value={name} onChange={(e)=>setName(e.target.value)} placeholder='Project name'/><button onClick={()=>createProject.mutate({name})}>Create Project</button></div><div className='grid'>{data.map((project)=><Link className='card' key={project._id} to={`/projects/${project._id}`}>{project.name}<small>{project.status}</small></Link>)}</div></div>;
};

export default DashboardPage;

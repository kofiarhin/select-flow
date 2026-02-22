import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useProject } from '../hooks/useProjects';

const ProjectPage = () => {
  const { id } = useParams();
  const { data } = useProject(id);
  if (!data) return <div>Loading...</div>;
  const { project, images } = data;
  const originals = images.filter((img) => img.phase === 'ORIGINAL');
  const finals = images.filter((img) => img.phase === 'FINAL');

  const upload = async (e, route) => {
    const formData = new FormData();
    [...e.target.files].forEach((file) => formData.append('files', file));
    await api.post(`/api/projects/${id}/upload/${route}`, formData);
    window.location.reload();
  };

  return <div className='page'><h1>{project.name}</h1><p>Status: {project.status}</p><p>Client link: {`${window.location.origin}/gallery/${project.clientAccessToken}`}</p><input type='file' multiple onChange={(e)=>upload(e,'originals')}/><input type='file' multiple onChange={(e)=>upload(e,'finals')}/><a href={`${import.meta.env.VITE_API_URL}/api/projects/${id}/download/selected`} target='_blank'>Download Selected ZIP</a><h2>Originals</h2><div className='grid'>{originals.map((img)=><img key={img._id} src={`${import.meta.env.VITE_API_URL}/api/assets/previews/${project._id}/${img.previewPath.split('/').pop()}?token=${project.clientAccessToken}`} />)}</div><h2>Finals</h2><div className='grid'>{finals.map((img)=><img key={img._id} src={`${import.meta.env.VITE_API_URL}/api/assets/finals/${project._id}/${img.storagePath.split('/').pop()}?token=${project.clientAccessToken}`} />)}</div></div>;
};

export default ProjectPage;

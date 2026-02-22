import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGallery, useSaveSelection } from '../hooks/useGallery';

const GalleryPage = () => {
  const { clientAccessToken } = useParams();
  const { data } = useGallery(clientAccessToken);
  const save = useSaveSelection(clientAccessToken);
  const [selected, setSelected] = useState([]);
  if (!data) return <div>Loading...</div>;
  const isFinal = data.project.status === 'FINAL_DELIVERED';

  return <div className='page'><h1>{data.project.name}</h1><div className='grid'>{data.images.map((img)=><button key={img._id} className={`thumb ${selected.includes(img._id)?'active':''}`} onClick={()=>!isFinal && setSelected(selected.includes(img._id)?selected.filter((id)=>id!==img._id):[...selected,img._id])}><img src={`${import.meta.env.VITE_API_URL}/api/assets/${isFinal?'finals':'previews'}/${data.project._id}/${(isFinal?img.storagePath:img.previewPath).split('/').pop()}?token=${clientAccessToken}`}/></button>)}</div>{!isFinal?<button onClick={()=>save.mutate(selected)}>Save Selection</button>:<a href={`${import.meta.env.VITE_API_URL}/api/gallery/${clientAccessToken}/download/finals`}>Download All</a>}</div>;
};

export default GalleryPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../../baseUtl';

export const Profile = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const [image, setImage] = useState<string | null>(null);
    const access_token = String(localStorage.getItem('token'));

    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    };

    const getImage = async () => {
        try {
            const response = await axios.post(`${baseURL}/api/get-image`, null, {
                headers: {
                    'Authorization': access_token,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            const imageUrl = response.data.message; // URL изображения
            setImage(imageUrl);
        } catch (error) {
            console.error('Ошибка при получении изображения:', error);
        }
    }
    

    const handleUpload = async () => {
        if (!file) {
            console.error("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        if (typeof access_token !== 'string') return

        try {
            const response = await axios.post(`${baseURL}/api/upload-image`, formData, {
                headers: {
                    'Authorization': access_token,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            console.log('Image uploaded successfully:', response.data);
            getImage();

        } catch (error) {
            console.error('Error uploading image:', error);
        }        
    };

    const exit = () => {
        localStorage.clear();
        navigate('/auth')
    }

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {/* <button onClick={getImage}>Upload</button> */}
            {image && <img src={image} alt="" />}

            <div onClick={() => exit()}>
                Выход
            </div>
        </div>
    );
};

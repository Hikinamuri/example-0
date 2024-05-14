import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../../baseUtl';

import cl from './index.module.css'

// interface ProfileData {
//     first_name: string;
//     last_name: string;
//     taken_cards: [];
//     work_type: string;
// }
export const Profile = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const [image, setImage] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [workType, setWorkType] = useState<string>('');
    // const [profileData, setProfileData] = useState();

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

    const prepareFields = async (data: any) => {
        console.log('image1')

        if(data.first_name) setFirstName(data.first_name);
        if(data.last_name) setLastName(data.last_name);
        if(data.work_type) setWorkType(data.work_type);
        // if(data.phone) setPhone(formatPhoneNumber(data.phone) || data.phone);
    }

    const getProfile = async () => {
        try {
            const response = await axios.post(`${baseURL}/api/get-profile`, null, {
                headers: {
                    'Authorization': access_token,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            prepareFields(response.data);
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

    useEffect(() => {
        getImage();
        getProfile();
    }, []);

    return (
        <div className={cl.profile}>
            {!image && (
                <>
                    <label className={cl.uploadBtn} htmlFor="file">Choose Image</label>
                    <input 
                        className={cl.inputFile} 
                        id="file" 
                        type="file" 
                        accept=".png, .jpg, .jpeg"
                        onChange={handleFileChange} 
                    />

                    <button className={cl.uploadBtn} onClick={handleUpload}>Upload</button>
                </>
            )}
            {image && <img src={image} alt="" />}
            <div className={cl.mainIfo}>
                <p>{firstName}</p>
                <p>{lastName}</p>
                <p>{workType}</p>
            </div>
            <div className={cl.exitButton} onClick={() => exit()}>
                Выход
            </div>
        </div>
    );
    
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../../baseUtl';
import ProfileIcon from '../../assets/profile.svg';

import cl from './index.module.css'

interface Card {
    id: string;
    card_name: string;
    categoryname: string;
    description: string;
    price: string;
    timer: string;
}

export const Profile = () => {
    const navigate = useNavigate();
    // const [image, setImage] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Card[] | null>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [workType, setWorkType] = useState<string>('');
    // const [profileData, setProfileData] = useState();

    const access_token = String(localStorage.getItem('token'));
    const user_type = String(localStorage.getItem('type'));


    // const getImage = async () => {
    //     try {
    //         const response = await axios.post(`${baseURL}/api/get-image`, null, {
    //             headers: {
    //                 'Authorization': access_token,
    //                 'Content-Type': 'multipart/form-data' 
    //             }
    //         });
            
    //         const imageUrl = response.data.message; // URL изображения
    //         setImage(imageUrl);
    //     } catch (error) {
    //         console.error('Ошибка при получении изображения:', error);
    //     }
    // }

    const getTasks = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/get-user-cards`, {
                headers: {
                    'Authorization': access_token,
                }
            });
            
            const cardIds = response.data.user_cards.map((card: { id: number }) => card.id);
    
            const tasksPromises = cardIds.map(async (cardId: number) => {
                try {
                    const cardResponse = await axios.get(`${baseURL}/api/get-card?id=${cardId}`, {
                        headers: {
                            'Authorization': access_token,
                        }
                    });
                    return cardResponse.data.card as Card; // Приведение типа к интерфейсу Card
                } catch (error) {
                    console.error(`Ошибка при получении карточки с id ${cardId}:`, error);
                    return null; 
                }
            });
    
            const tasks = await Promise.all(tasksPromises);
    
            setTasks(tasks.filter((task: Card | null) => task !== null)); 
    
        } catch (error) {
            console.error('Ошибка при получении списка карточек:', error);
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
            const formData = new FormData();
            formData.append('user_type', user_type);
        
            const response = await axios.post(`${baseURL}/api/get-profile`, formData, {
                headers: {
                    'Authorization': access_token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            prepareFields(response.data);
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
        }        
    }


    const exit = () => {
        localStorage.clear();
        navigate('/auth')
    }

    useEffect(() => {
        // getImage();
        getProfile();
        getTasks();
    }, []);

    return (
        <div className={cl.profile}>
            <div className={cl.image_info}>
                {/* {!image && (
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
                )} */}
                <img src={ProfileIcon} alt="Профиль" />
                <div className={cl.mainIfo}>
                    <p>{firstName}</p>
                    <p>{lastName}</p>
                    <p>{workType}</p>
                </div>
            </div>
            <div className={cl.aded_tasks}>
                <p className={cl.main_name}>Задание, которые вы взяли</p>
                <div className={cl.speciality_list}>
                    {tasks?.map(card => (
                        <div key={card.id} className={cl.card}>
                            <p className={cl.card_name} >{card.card_name}</p>
                            <div className={cl.price_time}>
                                <p className={cl.card_price}>{card.price} ₽</p>
                                {parseInt(card.timer) > 24 ? 
                                    `${Math.floor(parseInt(card.timer) / 24)} дней ${parseInt(card.timer) % 24} часов` :
                                    `${parseInt(card.timer)} часов`
                                }
                            </div>
                            <p className={cl.card_description}>{card.description}</p>
                            <p className={cl.categoryName}>{card.categoryname}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className={cl.exitButton} onClick={() => exit()}>
                Выход
            </div>
        </div>
    );
    
};

import cl from './index.module.css';
import { useState } from 'react';
import { Reg } from './addCard';
import { useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../baseUtl';

interface Cards {
    id: string;
    cards: string;
    categoryname: string;
    description: string;
    price: string;
    timer: string;
}

export const Competitions = () => {
    const userType = localStorage.getItem('type');
    const [checked, setChecked] = useState(false);
    const [cards, setCards] = useState<Cards[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');


    const toggleModal = () => {
        setChecked(!checked);
    }

    const hideModal = () => {
        setChecked(false);
    }

    const deleteCard = async (id: any) => {
        try {
            const response = await axios.delete(`${baseURL}/api/delete-card/${id}`);
            getCards();
            console.log(response.data);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const categories = [
        { name: 'Все категории', id: ''},
        { name: 'Программирование', id: 'Программирование'},
        { name: 'Дизайн', id: 'Дизайн'},
        { name: 'Услуги', id: 'Услуги'},
        { name: 'Работа с текстом', id: 'Работа с текстом'},
        { name: 'Маркетинг', id: 'Маркетинг'},
        { name: 'Архитектура', id: 'Архитектура'},
        { name: 'Приложения', id: 'Приложения'},
    ];

    const filteredCards = cards.filter(card => {
        const cardName = card.cards ? card.cards.toLowerCase() : '';
        const description = card.description ? card.description.toLowerCase() : '';
        const categoryName = card.categoryname ? card.categoryname.toLowerCase() : '';
        return cardName.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase()) || categoryName.includes(searchTerm.toLowerCase());
    });
    

    const getCards = () => {
        axios.get(`${baseURL}/api/get-contest`)
        .then((response:any ) => {
            setCards(response.data);
            console.log(response.data, 'response')
        })
    }

    const addToMe = async (id: any) => {
        try {
            const access_token = localStorage.getItem('token'); // Получаем токен из локального хранилища

            const requestData = {
                card_id: id 
            };
    
            const headers = {
                'Authorization': `${access_token}`,
                'Content-Type': 'application/json'
            };

            const response = await axios.post(`${baseURL}/api/add-to-me-comp`, requestData, {
                headers: headers
            });
    
            console.log('Response:', response.data);
            getCards()
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        getCards();
    }, [])

    return (
        <div className={cl.works_page}>
            <div className={cl.search_div}>
                <input 
                    type="search" 
                    name="" 
                    id="" 
                    className={cl.search} 
                    placeholder='Поиск'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Обработчик изменения значения поиска
                />
                {userType === 'true' && (
                    <div 
                        className={cl.add_card}
                        onClick={() => toggleModal()}
                    >
                        <p>Добавить</p>
                    </div>
                )}
            </div>
            <div className={cl.speciality_header}>
                <div className={cl.speciality}>
                    <p className={cl.speciality_text}>Конкурсы</p>
                    <div className={cl.speciality_list}>
                        {filteredCards
                            .filter(card => !selectedCategory || card.categoryname === selectedCategory)
                            .map(card => (
                                <div key={card.id} className={cl.card}>
                                    <p className={cl.card_name} >{card.cards}</p>
                                    <div className={cl.price_time}>
                                        <p className={cl.card_price}>{card.price} ₽</p>
                                        {parseInt(card.timer) > 24 ? 
                                            `${Math.floor(parseInt(card.timer) / 24)} дней ${parseInt(card.timer) % 24} часов` :
                                            `${parseInt(card.timer)} часов`
                                        }
                                    </div>
                                    <p className={cl.card_description}>{card.description}</p>
                                    <p className={cl.categoryName}>{card.categoryname}</p>
                                    {userType === 'true' ? (
                                        <div 
                                            className={cl.delete_card}
                                            onClick={() => deleteCard(card.id)}
                                        >
                                            <p>Удалить</p>
                                        </div>
                                    ) : (
                                        <div 
                                            className={cl.delete_card}
                                            onClick={() => addToMe(card.id)}
                                        >
                                            <p>Взять в работу</p>
                                        </div>
                                    )
                                    }
                                </div>
                        ))}
                    </div>

                    <div className={cl.categories}>
                        <p className={cl.categories_text}>Тип проекта</p>
                            {categories.map(category => (
                                <div
                                    className={cl.category}
                                    key={category.id} 
                                    onClick={() => setSelectedCategory(category.id)}>
                                    {category.name}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            {checked && (
                <div className={cl.modalBackground} onClick={() => hideModal()}>
                    <div className={cl.modalContent} onClick={(e) => e.stopPropagation()}>
                        <Reg />
                    </div>
                </div>
            )}
        </div>
    )
}

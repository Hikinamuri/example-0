import cl from './index.module.css';
import { useState } from 'react';
import { Reg } from './addCard';
import { useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../baseUtl';

interface Cards {
    id: string;
    card_name: string;
    categoryname: string;
    description: string;
    price: string;
    timer: string;
}

export const Works = () => {
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

    const categories = [
        'Программирование',
        'Дизайн',
        'Услуги',
        'Работа с текстом',
        'Маркетинг',
        'Архитектура',
        'Приложения'
    ];

    const filteredCards = cards.filter(card => {
        return card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) || card.description.toLowerCase().includes(searchTerm.toLowerCase()) || card.categoryname.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        axios.get(`${baseURL}/api/get-cards`)
        .then((response:any ) => {
            setCards(response.data);
            console.log(response.data, 'response')
        })
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
            <div>
                <div className={cl.speciality}>
                    <p className={cl.speciality_text}>Задачи</p>
                    <div className={cl.speciality_list}>
                        {filteredCards // Используем отфильтрованные карточки для отображения
                            .filter(card => !selectedCategory || card.categoryname === selectedCategory)
                            .map(card => (
                                <div key={card.id} className={cl.card}>
                                    <p>{card.card_name}</p>
                                    <p>{card.categoryname}</p>
                                    <p>{card.price}</p>
                                    <p>{card.description}</p>
                                    <span>{card.timer}</span>
                                </div>
                        ))}
                    </div>

                    <div className={cl.categories}>
                        Тип проекта
                        <div className={cl.category}>
                            {categories.map(category => (
                                <div key={category} onClick={() => setSelectedCategory(category)}>
                                    {category}
                                </div>
                            ))}
                        </div>
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

import { useEffect, useState } from 'react';
import axios from 'axios';

import cl from './index.module.css';

import logo from '../../assets/logo.png';
import defaultLogo from '../../assets/default.png'

import developing from '../../assets/developing.png';
import copywriter from '../../assets/copywriter.png';
import designer from '../../assets/designer.png';
import management from '../../assets/management.png';
import marketing from '../../assets/marketing.png';
import smm_manager from '../../assets/smm_manager.png';


import { baseURL } from "../../baseUtl.ts";


interface Client {
    id: string;
    login: string;
    first_name: string;
    work_type: string;
    profile_photo: string;
    // Другие поля, если есть
}

export const Home = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [index, setIndex] = useState(0); // Состояние для отслеживания индекса массива
    const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Состояние для отслеживания, происходит ли анимация выезда
    const mass = [
        `Let your skills work for you`,
        `Freelancing made simple and easy`,
        `Take your freelance game to next level`,
        `Work smarter, not harder with freelancing`,
        `Unlock your freelance earning potencial`,
        `Your path to successful freelancing`,
        `Elevate your freelance experience`,
        `Your freelance success start here`,
        `Join the freelance revolution`
    ];

    const cards = [
        { name: 'Программирование', image: developing},
        { name: 'Дизайн', image: designer},
        { name: 'SMM-менеджер', image: smm_manager},
        { name: 'Маркетинг', image: marketing},
        { name: 'Копирайтинг', image: copywriter},
        { name: 'Менеджмент', image: management},
    ]

    useEffect(() => {
        // Функция для изменения индекса массива каждые несколько секунд
        const interval = setInterval(() => {
            setIsAnimatingOut(true); // Устанавливаем флаг, что началась анимация выезда
            setTimeout(() => {
                setIndex(prevIndex => (prevIndex + 1) % mass.length);
                setIsAnimatingOut(false); // Сбрасываем флаг после завершения анимации выезда
            }, 1000); // Период анимации выезда (1 секунда)
        }, 4000); // Интервал в миллисекундах, через который меняется текст

        return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
    }, []);

    useEffect(() => {
        axios.get(`${baseURL}/api/get-users`)
        .then((response:any ) => {
            setClients(response.data);
            console.log(response.data, 'response')
        })
    }, []);

    return (
        <div className={cl.home_page}>
            <div className={cl.home_page_text}>
                <div className={cl.main_text}>
                    <p>
                        Make your <br />
                        freelance wise
                    </p>
                    <div id="main" className={`${cl.container} ${isAnimatingOut ? cl.slideOutAnimation : ''}`}>
                        {mass[index]} {/* Вывод текста из массива */}
                    </div>

                </div>
                <img src={logo} alt="" />
            </div>

            <div className={cl.speciality}>
                <p>Выберите специальность нужную вам:</p>
                <div className={cl.speciality_list}>
                    {cards.map(card => (
                        <div className={cl.speciality_card}>
                            <img src={card.image} alt="" />
                            <p>{card.name}</p>
                        </div>
                    ))}
                </div>

                <p>Топ лучших фрилансеров этого года:</p>
                <div className={cl.speciality_list}>
                    {clients.map(client => (
                        <div className={cl.client_card}>
                            <img src={client.profile_photo} alt='' />
                            <div className={cl.client_info_work_type}>
                                <div className={cl.client_info}>
                                    <p>{client.first_name}</p>
                                    <p>@{client.login}</p>
                                </div>
                                {client.work_type ? (
                                    <p className={cl.work_type}>{client.work_type}</p>
                                ) : (
                                    ''
                                )
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
import wl from '../../assets/wl.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './index.css';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = useState(localStorage.getItem('token'));

    const buttons = [
        { name: "Работа", link: "/works" },
        { name: "Фрилансеры", link: "/freelancers" },
        { name: "Конкурсы", link: "/competitions" }
    ];

    return (
        <div className='header'>
            <div className='header_image' onClick={() => navigate('/home')}>
                <img src={wl} alt=""/>
            </div>
            
            <div className='button_list'>
                {buttons.map((button, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(`${button.link}`)} 
                        className={`$button ${location.pathname === button.link ? 'active_button' : ""}`}
                    >
                        {button.name}
                    </div>
                ))}
            </div>

            {token ? (
                <div 
                    className='button_reg'
                    onClick={() => navigate('/profile')}
                >
                    Профиль
                </div>
            ) : (
                
                <div className='auth_reg'>
                    <div 
                        className='button_auth'
                        onClick={() => navigate('/auth')}
                    >
                        Вход
                    </div>
                    <div
                        className='button_reg'
                        onClick={() => navigate('/reg')}
                    >
                        Регистрация
                    </div>
                </div>
            )}
        </div>
    )
}

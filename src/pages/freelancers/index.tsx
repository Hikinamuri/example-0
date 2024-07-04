import cl from './index.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileIcon from '../../assets/profile.svg';
import { baseURL } from '../../baseUtl';

interface Client {
    id: string;
    login: string;
    first_name: string;
    work_type: string;
    profile_photo: string;
}

interface Employeer {
    id: string;
    login: string;
    first_name: string;
    work_type: string;
    profile_photo: string;
}

export const Freelancers = () => {
    const [clients, setClients] = useState<Client[] | null>(null);
    const [employeers, setEmployeers] = useState<Employeer[] | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        axios.get(`${baseURL}/api/get-users`)
        .then((response:any ) => {
            setClients(response.data);
        })
        axios.get(`${baseURL}/api/get-employeers`)
        .then((response:any ) => {
            setEmployeers(response.data);
        })
    }, []);

    // Фильтрация клиентов
    const filteredClients = clients ? clients.filter(client => {
        return (
            (client.login && client.login.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.first_name && client.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.work_type && client.work_type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }) : [];
    
    const filteredEmployeers = employeers ? employeers.filter(employeer => {
        return (
            (employeer.login && employeer.login.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employeer.first_name && employeer.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employeer.work_type && employeer.work_type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }) : [];
    

    return (
        <div className={cl.works_page}>
            <div className={cl.search_div}>
                <input 
                    type="search" 
                    className={cl.search} 
                    placeholder='Поиск'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={cl.speciality_header}>
                <div className={cl.speciality}>
                    <p>Топ лучших фрилансеров этого года:</p>
                    <div className={cl.speciality_list}>
                        {filteredClients.map(client => (
                            <div className={cl.client_card} key={client.id}>
                                <img src={ProfileIcon} alt='' />
                                <div className={cl.client_info_work_type}>
                                    <div className={cl.client_info}>
                                        <p>{client.first_name}</p>
                                        <p>@{client.login}</p>
                                    </div>
                                    {client.work_type ? (
                                        <p className={cl.work_type}>{client.work_type}</p>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={cl.speciality}>
                    <p>Топ лучших работодателей этого года:</p>
                    <div className={cl.speciality_list}>
                        {filteredEmployeers.map(employeer => (
                            <div className={cl.client_card} key={employeer.id}>
                                <img src={ProfileIcon} alt='' />
                                <div className={cl.client_info_work_type}>
                                    <div className={cl.client_info}>
                                        <p>{employeer.first_name}</p>
                                        <p>@{employeer.login}</p>
                                    </div>
                                    {employeer.work_type ? (
                                        <p className={cl.work_type}>{employeer.work_type}</p>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

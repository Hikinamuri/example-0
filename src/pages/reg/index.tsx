import { baseURL } from "../../baseUtl.ts";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
// import ClientAccountingAPI from "../../modules/auth/api/ClientAccountingAPI.ts";
import notificationsActionConstants from "../../store/actions/notificationsActionConstants.ts";
import { badRegistration } from "../../store/actions/notificationsActions.ts";
import { RegInput } from "./regInput/index.tsx";

import './reg.css'

const initialValues = {
    login: '',
    last_name: '',
    first_name: '',
    patronymic: '',
    email: '',
    userType: true,
    categoryName: '',
    password: '',
    password2: '',
};

const RegistrationSchema = Yup.object().shape({
    login: Yup.string()
        .trim()
        .min(5, 'Не менее 5 символов')
        .max(20, 'Не более 20 символов')
        .required("Имя пользователя обязательно"),
    last_name: Yup.string()
        .trim()
        .min(5, 'Не менее 5 символов')
        .max(20, 'Не более 20 символов')
        .required("Фамилия обязательна"),
    first_name: Yup.string()
        .trim()
        .min(5, 'Не менее 5 символов')
        .max(20, 'Не более 20 символов')
        .required("Имя обязательно"),
    patronymic: Yup.string()
        .trim()
        .max(20, 'Не более 20 символов'),
    email: Yup.string()
        .trim()
        .email("Некорректный формат адреса электронной почты")
        .required("Email обязателен"),
    password: Yup.string()
        .trim()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .max(18, 'Пароль должен содержать не более 18 символов')
        .required("Пароль обязателен"),
    password2: Yup.string()
        .trim()
        .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
        .required("Подтверждение пароля обязательно"),
});


export const Reg = () => {
    const navigate = useNavigate();

    const checkEmailReady = (email: string) => {
        const emailRegex = /@../;
        return emailRegex.test(email);
    }

    // const checkPasswordReady = (password: string) => {
    //     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\s]).{8,}/;
    //     return passwordRegex.test(password);
    // }

    const checkValidationReady = () => {
        const phraseArr: string[] = [];

        // if (!registrationFormik.values.last_name) {
        //     phraseArr.push('Заполните поле "ФИО"');
        // }

        // if (!checkFIOField(registrationFormik.values.first_name)) {
        //     phraseArr.push('Некорректно заполнено поле "ФИО"');
        // }

        if (!registrationFormik.values.email) {
            phraseArr.push('Заполните поле "Email"');
        }

        if (!checkEmailReady(registrationFormik.values.email)) {
            phraseArr.push('Некорректно заполнено поле "Email"');
        }

        if (!registrationFormik.values.password) {
            phraseArr.push('Заполните поле "Пароль"');
        }

        // if (!checkPasswordReady(registrationFormik.values.password)) {
        //     phraseArr.push('Пароль должен включать 8 символов с наличием заглавной, строчной букв и спецсимволов');
        // }

        if (registrationFormik.values.password2 !== registrationFormik.values.password) {
            phraseArr.push('Пароли не совпадают');
        }

       if(phraseArr.length > 0 ) {
            badRegistration({
                type: notificationsActionConstants.BAD_REGISTRATION,
                payload: phraseArr.join('.')
        });
        

            return false
       } else return true
            
    };

    const sendRequest = async () => {
        try {
            const response = await axios.post(`${baseURL}/api/save-user`, {
                login: registrationFormik.values.login, 
                last_name: registrationFormik.values.last_name, 
                first_name: registrationFormik.values.first_name, 
                patronymic: registrationFormik.values.patronymic, 
                email: registrationFormik.values.email, 
                password: registrationFormik.values.password,
                userType: registrationFormik.values.userType === 'customer',
            });
            console.log('request', response)
    
            setTimeout(() => {
                if (response.status === 200 && !response.data.error) {
                    // Навигация пользователя после успешной авторизации
                    alert('Регистрация прошла успешно!"')
                    navigate('/auth');
                } else {
                    console.log(response.status);
                }
            }, 1000);
        } catch (error: any) {
            console.log('error', error.message);
        }
    }
    


    const registrationFormik = useFormik({
        initialValues: { ...initialValues, userType: 'customer' },
        validationSchema: RegistrationSchema,
        onSubmit: () => {
            if(checkValidationReady()) sendRequest();
        },
    });

    const navigateToAuthorization = () => {
        navigate('/auth');
    }

    const setUserType = (value: any) => {
        registrationFormik.setFieldValue('userType', String(value));
    };

    return(
        <div className="auth">
            {/* <div className="photo">
                <img src="./tatmis.png" alt="" />
            </div> */}
            <div className="auth_form">
                <form className="auth_form_inputs-reg" onSubmit={registrationFormik.handleSubmit}>
                    <p className="company_name">WiseLance</p>
                    <RegInput
                        placeholder={'Имя пользователя'}
                        value={registrationFormik.values.login}
                        onChange={registrationFormik.handleChange}
                        name={'login'}
                        error={registrationFormik.errors.login}
                    />
                    {registrationFormik.errors.login && registrationFormik.touched.login && (
                        <div className="error-notification">{registrationFormik.errors.login}</div>
                    )}
                    <RegInput
                        placeholder={'Фамилия'}
                        value={registrationFormik.values.last_name}
                        onChange={registrationFormik.handleChange}
                        name={'last_name'}
                        error={registrationFormik.errors.last_name}
                    />
                    {registrationFormik.errors.last_name && registrationFormik.touched.last_name && (
                        <div className="error-notification">{registrationFormik.errors.last_name}</div>
                    )}
                    <RegInput
                        placeholder={'Имя'}
                        value={registrationFormik.values.first_name}
                        onChange={registrationFormik.handleChange}
                        name={'first_name'}
                        error={registrationFormik.errors.first_name}
                    />
                    {registrationFormik.errors.first_name && registrationFormik.touched.first_name && (
                        <div className="error-notification">{registrationFormik.errors.first_name}</div>
                    )}
                    <RegInput
                        placeholder={'Отчество'}
                        value={registrationFormik.values.patronymic}
                        onChange={registrationFormik.handleChange}
                        name={'patronymic'}
                        error={registrationFormik.errors.patronymic}
                    />
                    <RegInput
                        placeholder={'Почта'}
                        value={registrationFormik.values.email}
                        onChange={registrationFormik.handleChange}
                        name={'email'}
                        error={registrationFormik.errors.email}
                    />
                    {registrationFormik.errors.email && registrationFormik.touched.email && (
                        <div className="error-notification">{registrationFormik.errors.email}</div>
                    )}
                    <RegInput
                        placeholder={'Пароль'}
                        value={registrationFormik.values.password}
                        onChange={registrationFormik.handleChange}
                        name={'password'}
                        error={registrationFormik.errors.password}
                        type="password"
                    />
                    {registrationFormik.errors.password && registrationFormik.touched.password && (
                        <div className="error-notification">{registrationFormik.errors.password}</div>
                    )}
                    <RegInput
                        placeholder={'Повторите пароль'}
                        value={registrationFormik.values.password2}
                        onChange={registrationFormik.handleChange}
                        name={'password2'}
                        error={registrationFormik.errors.password2}
                        type="password"
                    />
                    {registrationFormik.errors.password2 && registrationFormik.touched.password2 && (
                        <div className="error-notification">{registrationFormik.errors.password2}</div>
                    )}
                    <div className="radio_buttons">
                        <div>
                            <input
                                type="radio"
                                id="customer"
                                name="userType"
                                value="customer"
                                checked={registrationFormik.values.userType === 'customer'}
                                onChange={() => setUserType('customer')}
                            />
                            <label htmlFor="customer">Вы заказчик?</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="user"
                                name="userType"
                                value="user"
                                checked={registrationFormik.values.userType === 'user'}
                                onChange={() => setUserType('user')}
                            />
                            <label htmlFor="user">Вы пользователь?</label>
                        </div>
                    </div>

                    <button type="submit" className="auth_button">
                        Зарегистрироваться
                    </button>
                    <a onClick={navigateToAuthorization} className="navigateToRegistration">Уже есть аккаунт? Авторизоваться</a>
                </form>
            </div>
        </div>
    )
}
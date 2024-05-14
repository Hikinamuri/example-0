// import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { baseURL } from "../../baseUtl.ts";
import * as Yup from "yup";
import axios from "axios";
import { RegInput } from "./regInput/index.tsx";
import notificationsActionConstants from "../../store/actions/notificationsActionConstants.ts";
import { goodMove, badAuthorization } from "../../store/actions/notificationsActions.ts";

import './auth.css';

const initialValues = {
    email: '',
    password: '',
};

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address format")
        .required("Email is required"),
    password: Yup.string().required()
});

export const Authorization = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const sendReq = async (values: any) => {
        try {
            const response = await axios.post(`${baseURL}/api/auth-user`, {
                email: values.email,
                password: values.password
            });
            localStorage.clear();
            localStorage.setItem('token', `${response.data.access_token}`);
            localStorage.setItem('type', `${response.data.userType}`);
            dispatch(goodMove({
                type: notificationsActionConstants.GOOD_MOVE,
                payload: 'Успешно авторизованы'
            }));
            navigate('/profile');
        } catch (error: any) {
            console.error("Error:", error);
            if (error.response) {
                console.log("Response status:", error.response.status);
            } else {
                console.log("No response from server.");
            }
    
            dispatch(badAuthorization({
                type: notificationsActionConstants.BAD_AUTHORIZATION,
                payload: 'Ошибка авторизации'
            }));
        }
    };
    
    
    

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: LoginSchema,
        onSubmit: (values) => {
            sendReq(values);
        }
    });

    const navigateToRegistration = () => {
        navigate('/reg');
    };

    return (
        <div className="auth">
            <div className="auth_form">
                <form className="auth_form_inputs" onSubmit={formik.handleSubmit}>
                    <p className="company_name">Тат<p>Платформа</p></p>
                    {formik.errors.email && (
                        <div className="error-message">
                            {formik.errors.email}
                        </div>
                    )}
                    <RegInput placeholder={'Почта'}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        name={'email'}
                        error={formik.errors.email}
                    />
                    <RegInput placeholder={'Пароль'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        name={'password'}
                        type={'password'}
                        error={formik.errors.password}
                    />
                    <button className="auth_button" type="submit">
                        Aвторизоваться
                    </button>
                    <a onClick={navigateToRegistration} className="navigateToRegistration">Еще нет аккаунта? Зарегистрироваться</a>
                </form>
            </div>
        </div>
    );
};

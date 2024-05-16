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
        .trim()
        .email("Некорректный формат адреса электронной почты")
        .required("Email обязателен"),
    password: Yup.string()
        .trim()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .max(18, 'Пароль должен содержать не более 18 символов')
        .required("Пароль обязателен"),
});

export const Authorization = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const checkEmailReady = (email: string) => {
        const emailRegex = /@../;
        return emailRegex.test(email);
    }

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
                <form className="auth_form_inputs-reg" onSubmit={formik.handleSubmit}>
                    <p className="company_name">WiseLance</p>
                    <RegInput placeholder={'Почта'}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        name={'email'}
                        error={formik.errors.email}
                    />
                    {formik.errors.email && formik.touched.email && (
                        <div className="error-notification">{formik.errors.email}</div>
                    )}
                    <RegInput placeholder={'Пароль'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        name={'password'}
                        type={'password'}
                        error={formik.errors.password}
                    />
                    {formik.errors.password && formik.touched.password && (
                        <div className="error-notification">{formik.errors.password}</div>
                    )}
                    <button className="auth_button" type="submit">
                        Aвторизоваться
                    </button>
                    <a onClick={navigateToRegistration} className="navigateToRegistration">Еще нет аккаунта? Зарегистрироваться</a>
                </form>
            </div>
        </div>
    );
};

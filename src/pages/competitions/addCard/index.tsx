import { baseURL } from "../../../baseUtl.ts";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { RegInput } from "./regInput/index.tsx";

import './reg.css'

interface InitialValues {
    name: string;
    price: string;
    description: string;
    timer: string;
    categoryName: string;
}

const initialValues: InitialValues = {
    name: '',
    price: '',
    description: '',
    timer: '',
    categoryName: '',
};


const categories = [
    'Программирование',
    'Дизайн',
    'Услуги',
    'Работа с текстом',
    'Маркетинг',
    'Архитектура',
    'Приложения'
];

const RegistrationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(50, 'Не менее 5 символов')
        .max(20, 'Не более 20 символов')
        .required("Название товара обязательно"),
    description: Yup.string()
        .trim()
        .min(20, 'Не менее 20 символов')
        .max(120, 'Не более 120 символов')
        .required("Описание обязательно"),
    price: Yup.string()
        .trim()
        .min(1, 'Не менее 1 символа')
        .max(20, 'Не более 20 символов')
        .required("Цена обязательно"),
    timer: Yup.string()
        .trim()
        .min(1, 'Не менее 1 символа')
        .max(20, 'Не более 20 символов')
        .required("Сроки работы обязательны"),
    categoryName: Yup.string()
        .required("Категория обязательна"),
});

export const Reg = () => {
    const sendRequest = async () => {

        try {
            const response = await axios.post(`${baseURL}/api/add-contest`, {
                name: registrationFormik.values.name, 
                description: registrationFormik.values.description, 
                price: registrationFormik.values.price, 
                timer: registrationFormik.values.timer, 
                categoryName: registrationFormik.values.categoryName, 
                // image: formData
            });
            console.log('request', response)
    
            setTimeout(() => {
                if (response.status === 200 && !response.data.error) {
                    // Навигация пользователя после успешной авторизации
                    window.location.reload();
                } else {
                    console.log(response.status);
                }
            }, 1000);
        } catch (error: any) {
            console.log('error', error.message);
        }
    };

    const registrationFormik = useFormik({
        initialValues,
        validationSchema: RegistrationSchema,
        onSubmit: () => {
            if (() => checkValidationReady()) sendRequest();
        },
        validateOnChange: true,
        validateOnBlur: true,
        validate: (values: InitialValues) => {
            const errors: Partial<InitialValues> = {};
        
            if (!/^\d+$/.test(values.price)) {
                errors.price = 'Цена должна содержать только цифры';
            }
        
            if (!/^\d+$/.test(values.timer)) {
                errors.timer = 'Таймер должен содержать только цифры';
            }
        
            return errors;
        },
        
    });

    const checkValidationReady = () => {
        // Validation logic
    };

    return(
            <div className="auth_form">
                <form className="auth_form_inputs" onSubmit={registrationFormik.handleSubmit}>
                <RegInput
                        placeholder={'Название'}
                        value={registrationFormik.values.name}
                        onChange={registrationFormik.handleChange}
                        name={'name'}
                        error={registrationFormik.errors.name}
                    />
                    {registrationFormik.errors.name && registrationFormik.touched.name && (
                        <div className="error-notification">{registrationFormik.errors.name}</div>
                    )}
                    <RegInput
                        placeholder={'Описание'}
                        value={registrationFormik.values.description}
                        onChange={registrationFormik.handleChange}
                        name={'description'}
                        error={registrationFormik.errors.description}
                    />
                    {registrationFormik.errors.description && registrationFormik.touched.description && (
                        <div className="error-notification">{registrationFormik.errors.description}</div>
                    )}
                    <RegInput
                        placeholder={'Цена'}
                        value={registrationFormik.values.price}
                        onChange={registrationFormik.handleChange}
                        name={'price'}
                        error={registrationFormik.errors.price}
                    />
                    {registrationFormik.errors.price && registrationFormik.touched.price && (
                        <div className="error-notification">{registrationFormik.errors.price}</div>
                    )}
                    <RegInput
                        placeholder={'Сроки (в часах)'}
                        value={registrationFormik.values.timer}
                        onChange={registrationFormik.handleChange}
                        name={'timer'}
                        error={registrationFormik.errors.timer}
                    />
                    {registrationFormik.errors.timer && registrationFormik.touched.timer && (
                        <div className="error-notification">{registrationFormik.errors.timer}</div>
                    )}
                    <div className="form-group">
                    <select
                        id="categoryName"
                        name="categoryName"
                        onChange={registrationFormik.handleChange}
                        onBlur={registrationFormik.handleBlur}
                        value={registrationFormik.values.categoryName}
                        className={`form-control ${registrationFormik.errors.categoryName ? 'is-invalid' : ''}`}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    {registrationFormik.errors.categoryName && (
                        <div className="invalid-feedback">{registrationFormik.errors.categoryName}</div>
                    )}
                    </div>
                    {/* {registrationFormik.errors.timer && registrationFormik.touched.categoryName && (
                        <div className="error-notification">{registrationFormik.errors.categoryName}</div>
                    )} */}
                    {/* <input type="file" onChange={handleFileChange} /> */}
                    {/* <button onClick={handleUpload} type="submit" className="auth_button">
                        Создать карточку
                    </button> */}
                    <button type="submit" className="auth_button">
                        Создать карточку
                    </button>
                </form>
            </div>
    )
}

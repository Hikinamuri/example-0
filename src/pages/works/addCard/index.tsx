import { baseURL } from "../../../baseUtl.ts";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { RegInput } from "./regInput/index.tsx";

import './reg.css'

const initialValues = {
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
    categoryName: Yup.string().required("Category is required"),
    // Add other validations for other fields
});

export const Reg = () => {
    // const [file, setFile] = useState(null);

    // const handleFileChange = (e: any) => {
    //     setFile(e.target.files[0]);
    // };

    // const handleUpload = async () => {
    //     if (!file) {
    //         console.error("No file selected");
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append('image', file);

    //     if (typeof access_token !== 'string') return

    //     try {
    //         const response = await axios.post(`${baseURL}/api/upload-card-image`, formData, {
    //             headers: {
    //                 'Authorization': access_token,
    //                 'Content-Type': 'multipart/form-data' 
    //             }
    //         });
    //         console.log('Image uploaded successfully:', response.data);
    //     } catch (error) {
    //         console.error('Error uploading image:', error);
    //     }        
    // };


    const sendRequest = async () => {
        // if (!file) {
        //     console.error("No file selected");
        //     return;
        // }

        // const formData = new FormData();
        // formData.append('image', file);

        try {
            const response = await axios.post(`${baseURL}/api/add-card`, {
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
                    // navigate('/auth');
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
                    <RegInput
                        placeholder={'Описание'}
                        value={registrationFormik.values.description}
                        onChange={registrationFormik.handleChange}
                        name={'description'}
                        error={registrationFormik.errors.description}
                    />
                    <RegInput
                        placeholder={'Цена'}
                        value={registrationFormik.values.price}
                        onChange={registrationFormik.handleChange}
                        name={'price'}
                        error={registrationFormik.errors.price}
                    />
                    <RegInput
                        placeholder={'Сроки'}
                        value={registrationFormik.values.timer}
                        onChange={registrationFormik.handleChange}
                        name={'timer'}
                        error={registrationFormik.errors.timer}
                    />
                    <div className="form-group">
                        <label htmlFor="categoryName">Категория</label>
                        <select
                            id="categoryName"
                            name="categoryName"
                            onChange={registrationFormik.handleChange}
                            onBlur={registrationFormik.handleBlur}
                            value={registrationFormik.values.categoryName}
                            className={`form-control ${registrationFormik.touched.categoryName && registrationFormik.errors.categoryName ? 'is-invalid' : ''}`}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        {registrationFormik.touched.categoryName && registrationFormik.errors.categoryName ? (
                            <div className="invalid-feedback">{registrationFormik.errors.categoryName}</div>
                        ) : null}
                    </div>
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

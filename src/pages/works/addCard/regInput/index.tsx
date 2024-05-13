import React from "react";
import { InputHTMLAttributes } from "react";
import './index.css';

type RegInputType = InputHTMLAttributes<HTMLInputElement> & {
    error: undefined | string
}
export const RegInput = ({placeholder, name, value, onChange, error, type='text'}: RegInputType) => (
    <div className="wrapperInput">
        <input
            className={"customInput"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            type={type}
        />
    </div>
);

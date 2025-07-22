import { useState } from "react";

export const useFormValidation = () => {
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const validateField = (name: string, value: any, schema: any): boolean => {
		const { error } = schema
			? schema.extract(name).validate(value)
			: schema.extract(name).validate(value);
		if (error) {
			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: error.details[0].message,
			}));
			return false;
		} else {
			setErrors((prevErrors) => {
				const newErrors = { ...prevErrors };
				delete newErrors[name];
				delete newErrors.global;
				return newErrors;
			});
			return true;
		}
	};

	const validateForm = (data: any, schema: any): boolean => {
		const { error } = schema
			? schema.validate(data, { abortEarly: false })
			: schema.validate(data, { abortEarly: false });
		if (error) {
			const validationErrors: { [key: string]: string } = {};
			error.details.forEach((err: any) => {
				validationErrors[err.path[0]] = err.message;
			});
			setErrors(validationErrors);
			return false;
		} else {
			setErrors({});
			return true;
		}
	};

	return { errors, setErrors, validateField, validateForm };
};

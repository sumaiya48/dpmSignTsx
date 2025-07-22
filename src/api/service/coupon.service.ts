import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import Joi from "joi";
import { AxiosError } from "axios";

class Coupon {
	private schema: {
		couponId: Joi.NumberSchema;
		name: Joi.StringSchema;
		code: Joi.StringSchema;
		discountType: Joi.StringSchema;
		amount: Joi.NumberSchema;
		minimumAmount: Joi.NumberSchema;
		endDate: Joi.DateSchema;
	};
	private couponBaseUrl: string;
	private createCouponUrl: string;
	private couponCheckUrl: string;
	public couponCreationSchema: Joi.ObjectSchema;
	public couponEditSchema: Joi.ObjectSchema;
	constructor() {
		this.schema = {
			couponId: Joi.number().required().messages({
				"number.base": "couponId must be a number.",
				"number.empty": "couponId cannot be empty.",
				"number.required": "couponId is required.",
			}),
			name: Joi.string().trim().required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"any.required": "Name is required.",
			}),
			code: Joi.string().trim().required().messages({
				"string.base": "Code must be a string.",
				"any.required": "Code is required.",
			}),
			discountType: Joi.string()
				.trim()
				.required()
				.valid("flat", "percentage")
				.messages({
					"string.base": "Discount type must be a string.",
					"any.required":
						"Discount type is required. It should be either flat or percentage.",
				}) as Joi.StringSchema<"flat" | "percentage">,
			amount: Joi.number().min(1).required().messages({
				"number.base": "Amount must be a number.",
				"number.empty": "Amount cannot be empty.",
				"number.min": "Amount should be minimum 1.",
				"number.required": "Amount is required.",
			}),
			minimumAmount: Joi.number().min(1).required().messages({
				"number.base": "Minimum Amount must be a number.",
				"number.empty": "Minimum Amount cannot be empty.",
				"number.min": "Minimum Amount should be minimum 1.",
				"number.required": "Minimum Amount is required.",
			}),
			endDate: Joi.date().required().messages({
				"number.base": "End Date must be a number.",
				"number.empty": "End Date cannot be empty.",
				"number.required": "End Date is required.",
			}),
		};

		this.couponBaseUrl = `${apiBaseURL}/coupon`;
		this.createCouponUrl = `${apiBaseURL}/coupon/create`;
		this.couponCheckUrl = `${apiBaseURL}/coupon/check`;

		this.couponCreationSchema = Joi.object({
			name: this.schema.name,
			code: this.schema.code,
			discountType: this.schema.discountType,
			amount: this.schema.amount,
			minimumAmount: this.schema.minimumAmount,
			endDate: this.schema.endDate,
		});
		this.couponEditSchema = Joi.object({
			name: this.schema.name,
			discountType: this.schema.discountType,
			amount: this.schema.amount,
			minimumAmount: this.schema.minimumAmount,
			endDate: this.schema.endDate,
		});
	}

	fetchAllCoupon = async (
		authToken: string,
		searchTerm: string,
		searchBy: "name" | "code",
		page: number,
		limit: number
	) => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (searchTerm.length > 0) {
				params.append("searchTerm", searchTerm);
				params.append("searchBy", searchBy);
			}

			const response = await apiClient.get(
				`${this.couponBaseUrl}/?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let fetchRequestError: ApiError;

			if (err instanceof AxiosError) {
				fetchRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw fetchRequestError;
			} else {
				fetchRequestError = err.response.data || err.response.data.error;
				fetchRequestError.status = err.response.data.status;
				fetchRequestError.message =
					fetchRequestError.message ||
					fetchRequestError.error.message ||
					"An unknown error occured.";
				throw fetchRequestError;
			}
		}
	};

	createCoupon = async (
		authToken: string,
		name: string,
		code: string,
		discountType: "flat" | "percentage",
		amount: number,
		minimumAmount: number,
		endDate: Date
	) => {
		try {
			const body = {
				name,
				code,
				discountType,
				amount,
				minimumAmount,
				endDate,
			};

			const response = await apiClient.post(this.createCouponUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};

	editCoupon = async (
		authToken: string,
		couponId: number,
		name: string,
		discountType: "flat" | "percentage",
		amount: number,
		minimumAmount: number,
		endDate: Date
	) => {
		try {
			const body = {
				couponId,
				name,
				discountType,
				amount,
				minimumAmount,
				endDate,
			};

			const response = await apiClient.put(`${this.couponBaseUrl}/`, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};

	deleteCoupon = async (authToken: string, couponId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.couponBaseUrl}/${couponId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};

	checkCouponStatus = async (
		code: string,
		totalPrice: number,
		couponId?: number
	) => {
		try {
			const body = {
				code,
				couponId,
				totalPrice,
			};

			const response = await apiClient.post(this.couponCheckUrl, body);
			return response.data;
		} catch (err: any) {
			let fetchRequestError: ApiError;

			if (err instanceof AxiosError) {
				fetchRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw fetchRequestError;
			} else {
				fetchRequestError = err.response.data || err.response.data.error;
				fetchRequestError.status = err.response.data.status;
				fetchRequestError.message =
					fetchRequestError.message ||
					fetchRequestError.error.message ||
					"An unknown error occured.";
				throw fetchRequestError;
			}
		}
	};
}

export default Coupon;

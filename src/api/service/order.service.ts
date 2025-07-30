import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";
import Joi from "joi";
import { CartItemProps } from "@/hooks/use-cart";

class Order {
	private orderBaseUrl: string;
	private orderCreateUrl: string;
	private createPaymentUrl: string;
	private updateOrderUrl: string;
	private schema: {
		orderId: Joi.NumberSchema;
		amount: Joi.NumberSchema;
		paymentMethod: Joi.StringSchema;
		name: Joi.StringSchema;
		email: Joi.StringSchema;
		phone: Joi.StringSchema;
		billingAddress: Joi.StringSchema;
		additionalNotes: Joi.StringSchema;
		deliveryMethod: Joi.StringSchema;
		deliveryDate: Joi.DateSchema;
		staffId: Joi.NumberSchema;
		couponId: Joi.NumberSchema;
		courierId: Joi.NumberSchema;
		courierAddress: Joi.StringSchema;
	};

	public paymentCreationSchema: Joi.ObjectSchema;
	public orderCreationScema: Joi.ObjectSchema;
	constructor() {
		this.orderBaseUrl = `${apiBaseURL}/order`;
		this.createPaymentUrl = `${apiBaseURL}/order/add-payment`;
		this.updateOrderUrl = `${apiBaseURL}/order/update-order`;
		this.schema = {
			orderId: Joi.number().required().messages({
				"number.base": "Order id must be a number.",
				"number.empty": "Order id cannot be empty.",
				"any.required": "Order id is required.",
			}),

			amount: Joi.number().required().min(1).messages({
				"number.base": "Amount must be a number.",
				"number.empty": "Amount cannot be empty.",
				"any.required": "Amount is required.",
				"number.min": "Amount must be greater than 0.",
			}),

			paymentMethod: Joi.string()
				.valid("online-payment", "cod-payment")
				.required()
				.messages({
					"string.base": "Payment method must be a string.",
					"string.empty": "Please select a payment method.",
					"any.required":
						"Payment method selection is required. Please choose either online payment or cash on delivery.",
				}) as Joi.StringSchema<"online-payment" | "cod-payment">,

			name: Joi.string().trim().min(2).required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"string.min": "Name must be at least 2 characters long.",
				"any.required": "Name is required.",
			}),

			email: Joi.string()
				.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
				.message("Invalid email address.")
				.optional()
				.allow("")
				.messages({
					"string.base": "Email must be a string.",
				}),

			phone: Joi.string()
				.trim()
				.required()
				.pattern(/^01[3-9][0-9]{8}$/)
				.messages({
					"string.pattern.base":
						"Phone number must be a valid Bangladeshi number starting with 01 and 11 digits long.",
					"string.empty": "Phone number cannot be empty.",
				}),

			billingAddress: Joi.string().trim().min(5).required().messages({
				"string.base": "Billing address must be a string.",
				"string.min": "Billing address must be at least 5 characters long.",
				"string.empty": "Billing address cannot be empty.",
				"any.required": "Billing address is required.",
			}),

			additionalNotes: Joi.string()
				.trim()
				.min(5)
				.optional()
				.allow("")
				.messages({
					"string.base": "Additional notes must be a string.",
					"string.min": "Additional notes must be at least 5 characters long.",
				}),

			deliveryMethod: Joi.string()
				.trim()
				.required()
				.valid("shop-pickup", "courier")
				.messages({
					"string.base": "Delivery method must be a string.",
					"string.empty": "Please select a delivery method.",
					"any.required":
						"Delivery method selection is required. Please choose either shop pickup or courier.",
				}) as Joi.StringSchema<"shop-pickup" | "courier">,

			deliveryDate: Joi.date().iso().required().allow(null).messages({
				"date.base": "deliveryDate must be a valid date.",
				"date.format": "deliveryDate must be in ISO 8601 format (YYYY-MM-DD).",
				"any.required": "deliveryDate is required.",
			}),

			staffId: Joi.number().optional().allow(null).messages({
				"number.base": "staffId must be a number.",
				"number.empty": "staffId cannot be empty.",
			}),

			couponId: Joi.number().optional().allow(null).messages({
				"number.base": "couponId must be a number.",
				"number.empty": "couponId cannot be empty.",
			}),

			courierId: Joi.number().optional().allow(null).messages({
				"number.base": "courierId must be a number.",
				"number.empty": "courierId cannot be empty.",
			}),

			courierAddress: Joi.string().trim().optional().allow("").messages({
				"string.base": "courierAddress must be a string.",
			}),
		};

		this.orderCreateUrl = `${apiBaseURL}/order/create`;
		this.paymentCreationSchema = Joi.object({
			orderId: this.schema.orderId,
			amount: this.schema.amount,
			paymentMethod: this.schema.paymentMethod,
			customerName: this.schema.name,
			customerEmail: this.schema.email,
			customerPhone: this.schema.phone,
		});
		this.orderCreationScema = Joi.object({
			name: this.schema.name,
			email: this.schema.email,
			phone: this.schema.phone,
			billingAddress: this.schema.billingAddress,
			additionalNotes: this.schema.additionalNotes,
			designFiles: Joi.array(),
			deliveryMethod: this.schema.deliveryMethod,
			deliveryDate: this.schema.deliveryDate,
			amount: this.schema.amount,
			staffId: this.schema.staffId,
			courierId: this.schema.courierId,
			courierAddress: this.schema.courierAddress,
			couponId: this.schema.couponId,
			orderItems: Joi.array(),
		});
	}

	createOrder = async (
		customerName: string,
		customerEmail: string,
		customerPhone: string,
		staffId: number | null,
		billingAddress: string,
		additionalNotes: string,
		deliveryMethod: string,
		deliveryDate: Date | null,
		designFiles: File[] | [],
		courierId: number | null,
		courierAddress: string,
		couponId: number | null,
		amount: number,
		orderTotal: number,
		orderItems: CartItemProps[],
		role: string | null
		// {
		// 	productId: number;
		// 	productVariantId?: number;
		// 	quantity: number;
		// 	size: number | null;
		// 	widthInch: number | null;
		// 	heightInch: number | null;
		// 	price: number;
		// }[]
	) => {
		try {
			const form = new FormData();

			// Append text fields to the FormData object
			form.append("customerName", customerName);
			form.append("customerEmail", customerEmail);
			form.append("customerPhone", customerPhone);
			form.append("billingAddress", billingAddress);
			form.append("additionalNotes", additionalNotes);
			form.append("deliveryMethod", deliveryMethod);
			if (deliveryDate) {
				form.append("deliveryDate", deliveryDate.toISOString());
			} else {
				form.append("deliveryDate", "null");
			}
			form.append("paymentMethod", "cod-payment");
			form.append("amount", amount.toString());
			form.append("orderTotal", orderTotal.toString());
			form.append("orderItems", JSON.stringify(orderItems));

			if (courierId && courierAddress) {
				form.append("courierId", courierId?.toString());
				form.append("courierAddress", courierAddress);
			}

			if (staffId) {
				form.append("staffId", staffId?.toString());
			}
			if (role) {
	form.append("role", role);
}
			if (couponId) {
				form.append("couponId", couponId?.toString());
			}

			if (designFiles.length > 0) {
				for (const file of designFiles) {
					form.append("designFiles", file, file.name);
				}
			}

			const response = await apiClient.post(this.orderCreateUrl, form, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
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
				console.log(err);
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

	deleteOrder = async (authToken: string, orderId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.orderBaseUrl}/${orderId}`,
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

	fetchAllOrders = async (
		authToken: string,
		searchTerm: string,
		searchBy:
			| "order-id"
			| "customer-name"
			| "customer-phone"
			| "customer-email",
		filteredBy: "all" | "active" | "requested" | "completed" | "cancelled",
		page: number,
		limit: number
	) => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				filteredBy,
			});

			if (searchTerm.length > 0) {
				params.append("searchTerm", searchTerm);
				params.append("searchBy", searchBy);
			}

			const response = await apiClient.get(
				`${this.orderBaseUrl}/?${params.toString()}`,
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

	createPayment = async (
		authToken: string,
		amount: number,
		orderId: number,
		paymentMethod: "online-payment" | "cod-payment",
		customerName: string,
		customerEmail: string,
		customerPhone: string
	) => {
		try {
			const body = {
				orderId,
				amount,
				paymentMethod,
				customerName,
				customerEmail,
				customerPhone,
			};
			const response = await apiClient.post(this.createPaymentUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
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

	updateOrder = async (
		authToken: string,
		orderId: number,
		deliveryDate: Date | null,
		status:
			| "order-request-received"
			| "consultation-in-progress"
			| "order-canceled"
			| "awaiting-advance-payment"
			| "advance-payment-received"
			| "design-in-progress"
			| "awaiting-design-approval"
			| "production-started"
			| "production-in-progress"
			| "ready-for-delivery"
			| "out-for-delivery"
			| "order-completed",
		courierAddress: string | null,
		additionalNotes: string
	) => {
		try {
			const body = {
				orderId,
				deliveryDate,
				status,
				courierAddress,
				additionalNotes,
			};
			const response = await apiClient.put(this.updateOrderUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
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

export default Order;

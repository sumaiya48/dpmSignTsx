import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import Joi from "joi";
import { AxiosError } from "axios";
import {
	ProductAttributesFormProps,
	Variant,
	Variation,
} from "@/pages/AddProduct";

class Product {
	private schema: {
		name: Joi.StringSchema;
		description: Joi.StringSchema;
		basePrice: Joi.NumberSchema;
		minOrderQuantity: Joi.NumberSchema;
		discountStart: Joi.NumberSchema;
		discountEnd: Joi.NumberSchema;
		discountPercentage: Joi.NumberSchema;
		pricingType: Joi.StringSchema;
	};

	public step1Schema: Joi.ObjectSchema;
	public step2Schema: Joi.ObjectSchema;

	private productBaseUrl: string;
	private createProductUrl: string;
	private createProductImageUrl: string;
	private editProductUrl: string;
	private editProductImageUrl: string;
	private activeProductUrl: string;
	private inactiveProductUrl: string;
	constructor() {
		this.schema = {
			name: Joi.string().trim().min(2).required().messages({
				"string.base": "Name must be a string.",
				"string.min": "Name should be minimum 2 characters long.",
				"string.empty": "Name cannot be empty.",
				"any.required": "Name is required.",
			}),
			description: Joi.string().trim().min(5).required().messages({
				"string.base": "Description must be a string.",
				"string.min": "Description should be minimum 5 characters long.",
				"string.empty": "Description cannot be empty.",
				"any.required": "Description is required.",
			}),
			basePrice: Joi.number().required().messages({
				"number.base": "Base price must be a number.",
				"number.empty": "Base price cannot be empty.",
				"any.required": "Base price is required.",
			}),
			minOrderQuantity: Joi.number().required().messages({
				"number.base": "Minimum order quantity must be a number.",
				"number.empty": "Minimum order quantity cannot be empty.",
				"any.required": "Minimum order quantity is required.",
			}),
			discountStart: Joi.number().optional().allow(null).messages({
				"number.base": "Discount start  must be a number.",
				"number.empty": "Discount start  cannot be empty.",
			}),
			discountEnd: Joi.number().optional().allow(null).messages({
				"number.base": "Discount end  must be a number.",
				"number.empty": "Discount end  cannot be empty.",
			}),
			discountPercentage: Joi.number().optional().allow(null).messages({
				"number.base": "Discount percentage must be a number.",
				"number.empty": "Discount percentage cannot be empty.",
			}),
			pricingType: Joi.string()
				.trim()
				.required()
				.valid("flat", "square-feet")
				.messages({
					"string.base": "Pricing type must be a string.",
					"string.empty": "Please select a pricing type.",
					"any.required": "Pricing type is required.",
				}) as Joi.StringSchema<"flat" | "square-feet">,
		};

		this.step1Schema = Joi.object({
			name: this.schema.name,
			description: this.schema.description,
		});

		this.step2Schema = Joi.object({
			basePrice: this.schema.basePrice,
			minOrderQuantity: this.schema.minOrderQuantity,
			discountStart: this.schema.discountStart,
			discountEnd: this.schema.discountEnd,
			discountPercentage: this.schema.discountPercentage,
			pricingType: this.schema.pricingType,
		});

		this.productBaseUrl = `${apiBaseURL}/product`;
		this.createProductUrl = `${apiBaseURL}/product/create/`;
		this.createProductImageUrl = `${apiBaseURL}/product/upload-image/`;
		this.editProductUrl = `${apiBaseURL}/product`;
		this.editProductImageUrl = `${apiBaseURL}/product/edit-image/`;
		this.activeProductUrl = `${apiBaseURL}/product/active`;
		this.inactiveProductUrl = `${apiBaseURL}/product/inactive`;
	}

	createProduct = async (
		authToken: string,
		name: string,
		description: string,
		basePrice: number,
		minOrderQuantity: number,
		pricingType: string,
		categoryId: number | null,
		isActive: boolean,
		attributes: ProductAttributesFormProps[],
		tags: string[],
		variations: Variation[],
		variants: Variant[],
		discountStart?: number,
		discountEnd?: number,
		discountPercentage?: number
	) => {
		try {
			if (variations.length > 0) {
				variations = variations.map((variation) => {
					const { id, ...restVariationProp } = variation;
					if (restVariationProp.variationItems.length > 0) {
						restVariationProp.variationItems =
							restVariationProp.variationItems.map((variationItem) => {
								const { id, ...restVariationItemProp } = variationItem;
								return { ...restVariationItemProp };
							}) as any;
					}
					return {
						...restVariationProp,
					};
				}) as any;
			}

			if (variants.length > 0) {
				variants = variants.map((variant) => {
					const { id, ...restProp } = variant;
					return {
						...restProp,
					};
				}) as any;
			}

			const body = {
				name,
				description,
				basePrice,
				minOrderQuantity,
				discountStart,
				discountEnd,
				discountPercentage,
				pricingType,
				categoryId,
				isActive,
				attributes,
				tags,
				variations,
				variants,
			};

			const response = await apiClient.post(this.createProductUrl, body, {
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

	createProductImage = async (
		authToken: string,
		productId: number,
		images: File[] | []
	) => {
		try {
			const form = new FormData();
			form.append("productId", productId.toString());

			if (images.length > 0) {
				for (const image of images) {
					form.append("product-images", image, image.name);
				}
			}

			const response = await apiClient.post(this.createProductImageUrl, form, {
				headers: {
					Authorization: `Bearer ${authToken}`,
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

	editProduct = async (
		authToken: string,
		productId: number,
		name: string,
		description: string,
		basePrice: number,
		minOrderQuantity: number,
		pricingType: string,
		categoryId: number | null,
		isActive: boolean,
		attributes: ProductAttributesFormProps[],
		tags: string[],
		variations: Variation[],
		variants: Variant[],
		discountStart?: number,
		discountEnd?: number,
		discountPercentage?: number
	) => {
		try {
			if (variations.length > 0) {
				variations = variations.map((variation) => {
					const { id, ...restVariationProp } = variation;
					if (restVariationProp.variationItems.length > 0) {
						restVariationProp.variationItems =
							restVariationProp.variationItems.map((variationItem) => {
								const { id, ...restVariationItemProp } = variationItem;
								return { ...restVariationItemProp };
							}) as any;
					}
					return {
						...restVariationProp,
					};
				}) as any;
			}

			if (variants.length > 0) {
				variants = variants.map((variant) => {
					const { id, ...restProp } = variant;
					return {
						...restProp,
					};
				}) as any;
			}

			const body = {
				productId,
				name,
				description,
				basePrice,
				minOrderQuantity,
				discountStart,
				discountEnd,
				discountPercentage,
				pricingType,
				categoryId,
				isActive,
				attributes,
				tags,
				variations,
				variants,
			};

			const response = await apiClient.put(this.editProductUrl, body, {
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

	editProductImage = async (
		authToken: string,
		productId: number,
		images: File[] | []
	) => {
		try {
			const form = new FormData();
			form.append("productId", productId.toString());

			if (images.length > 0) {
				for (const image of images) {
					form.append("product-images", image, image.name);
				}
			}

			const response = await apiClient.put(this.editProductImageUrl, form, {
				headers: {
					Authorization: `Bearer ${authToken}`,
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

	activeProduct = async (authToken: string, productId: number) => {
		try {
			const response = await apiClient.get(
				`${this.activeProductUrl}/?productId=${productId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let closeRequestError: ApiError;

			if (err instanceof AxiosError) {
				closeRequestError = {
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
				throw closeRequestError;
			} else {
				closeRequestError = err.response.data || err.response.data.error;
				closeRequestError.status = err.response.data.status;
				closeRequestError.message =
					closeRequestError.message ||
					closeRequestError.error.message ||
					"An unknown error occured.";
				throw closeRequestError;
			}
		}
	};

	inactiveProduct = async (authToken: string, productId: number) => {
		try {
			const response = await apiClient.get(
				`${this.inactiveProductUrl}/?productId=${productId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let closeRequestError: ApiError;

			if (err instanceof AxiosError) {
				closeRequestError = {
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
				throw closeRequestError;
			} else {
				closeRequestError = err.response.data || err.response.data.error;
				closeRequestError.status = err.response.data.status;
				closeRequestError.message =
					closeRequestError.message ||
					closeRequestError.error.message ||
					"An unknown error occured.";
				throw closeRequestError;
			}
		}
	};

	fetchProductById = async (authToken: string, productId: number) => {
		try {
			const response = await apiClient.get(
				`${this.productBaseUrl}/${productId}`,
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

	fetchAllProduct = async (
		authToken: string,
		searchTerm: string,
		searchBy: "name" | "sku",
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
				`${this.productBaseUrl}/?${params.toString()}`,
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

	deleteProduct = async (authToken: string, productId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.productBaseUrl}/${productId}`,
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
}

export default Product;

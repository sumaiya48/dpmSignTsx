import { ChangeEvent, useEffect, useState } from "react";
import Header from "@/components/header";
import slugify from "slugify";
import { Stepper } from "@mantine/core";
import { useFormValidation } from "@/hooks/use-form-validation";
import { productService } from "@/api";
import { useSearchParams } from "react-router-dom";
import { ProductBasicInfoForm } from "@/components/product/product-basic-info-form";
import { ProductPricingForm } from "@/components/product/product-pricing-form";
import { ProductVariationForm } from "@/components/product/product-variation-form";
import { ProductImageForm } from "@/components/product/product-image-form";
import { ProductPublishForm } from "@/components/product/product-publish-form";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@mantine/hooks";
import { useToast } from "@/hooks/use-toast";
import { ProductProps, useProduct } from "@/hooks/use-product";

export interface ProductFormProps {
	name: string;
	slug: string;
	description: string;
	categoryId: number;
	basePrice: number;
	minOrderQuantity: number | undefined;
	discountStart: number | undefined;
	discountEnd: number | undefined;
	discountPercentage: number | undefined;
	pricingType: string;
	productAttributes: ProductAttributesFormProps[];
	productTags: string[];
	variations: Variation[];
	variants: Variant[];
	productImages: File[] | [];
	isActive: boolean;
}

export interface ProductAttributesFormProps {
	attributeId?: number;
	property: string;
	description: string;
}

export interface Variation {
	id: number;
	name: string;
	unit: string;
	variationItems: VariationItem[];
}

export interface VariationItem {
	id: number;
	value: string;
}

export interface Variant {
	id: number;
	additionalPrice: number; // Changed from price to additionalPrice
	variantDetails: VariantDetail[];
}

export interface VariantDetail {
	variationName: string;
	variationItemValue: string;
}

const AddProduct = () => {
	const [searchParams] = useSearchParams();
	const productId: number | null =
		(searchParams.get("productId") && Number(searchParams.get("productId"))) ||
		null;
	const [isEditMode, setIsEditMode] = useState<boolean>(false);
	const [product, setProduct] = useState<ProductProps | null>(null);
	const { fetchProductById } = useProduct();

	const { toast } = useToast();
	const [active, setActive] = useState<number>(0);
	const { authToken, logout } = useAuth();
	const [loading, setLoading] = useDisclosure();
	const { errors, validateField, validateForm } = useFormValidation();
	const [productFormData, setProductFormData] = useState<ProductFormProps>({
		name: "",
		slug: slugify("", { lower: true }),
		description: "",
		categoryId: 0,
		basePrice: 0,
		minOrderQuantity: undefined,
		discountStart: undefined,
		discountEnd: undefined,
		discountPercentage: undefined,
		pricingType: "",
		productAttributes: [],
		productTags: [],
		variations: [],
		variants: [],
		productImages: [],
		isActive: true,
	});

	useEffect(() => {
		if (productId) {
			const fetchProductForEdit = async () => {
				const fetchedProduct = await fetchProductById(productId);

				if (fetchedProduct) {
					setIsEditMode(true);
					setProduct(fetchedProduct);

					setProductFormData({
						name: product?.name || "",
						slug: slugify(product?.slug || "", { lower: true }),
						description: product?.description || "",
						categoryId: product?.categoryId || 0,
						basePrice: product?.basePrice || 0,
						minOrderQuantity: product?.minOrderQuantity || undefined,
						discountStart: product?.discountStart || undefined,
						discountEnd: product?.discountEnd || undefined,
						discountPercentage: product?.discountPercentage || undefined,
						pricingType: product?.pricingType || "",
						productAttributes:
							product?.attributes.map((attribute) => ({
								property: attribute.property,
								description: attribute.description,
							})) || [],
						productTags: product?.tags
							? product.tags.map((tag) => tag.tag)
							: [],
						variations: product?.variations
							? product.variations.map((variation) => {
									return {
										id: variation.variationId,
										name: variation.name,
										unit: variation.unit,
										variationItems: variation.variationItems.map(
											(variationItem) => ({
												id: variationItem.variationItemId,
												value: variationItem.value,
											})
										),
									};
							  })
							: [],
						variants:
							product?.variants && product.variations
								? product.variants.map((variant) => ({
										id: variant.productVariantId,
										additionalPrice: variant.additionalPrice,
										variantDetails: variant.variantDetails.map((detail) => {
											// Find the corresponding variation name
											const variation = product.variations.find((v) =>
												v.variationItems.some(
													(item) =>
														item.variationItemId === detail.variationItemId
												)
											);

											return {
												variationName: variation ? variation.name : "",
												variationItemValue: detail.variationItem.value,
											};
										}),
								  }))
								: [],
						productImages: product?.images
							? await Promise.all(
									product.images.map(async (image) => {
										const response = await fetch(image.imageUrl);
										const blob = await response.blob();
										return new File([blob], image.imageName, {
											type: blob.type,
										});
									})
							  )
							: [],
						isActive: product?.isActive ?? true,
					});
				}
			};

			fetchProductForEdit();
		}
	}, [product]);

	const nextStep = () => {
		const step1FormData = {
			name: productFormData.name,
			description: productFormData.description,
		};
		const step2FormData = {
			basePrice: productFormData.basePrice,
			minOrderQuantity: productFormData.minOrderQuantity,
			discountStart: productFormData.discountStart,
			discountEnd: productFormData.discountEnd,
			discountPercentage: productFormData.discountPercentage,
			pricingType: productFormData.pricingType,
		};

		const currentFormData =
			active === 0
				? step1FormData
				: active === 1
				? step2FormData
				: step1FormData;
		const currentSchema =
			active === 0
				? productService.step1Schema
				: active === 1
				? productService.step2Schema
				: productService.step1Schema;

		const isFormValidated = validateForm(currentFormData, currentSchema);

		if (isFormValidated) {
			setActive((current) => (current < 4 ? current + 1 : current));
		}
	};
	const prevStep = () => {
		setActive((current) => (current > 0 ? current - 1 : current));
	};

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		if (
			[
				"name",
				"description",
				"basePrice",
				"minOrderQuantity",
				"discountStart",
				"discountEnd",
				"discountPercentage",
			].includes(e.target.name)
		) {
			const { name, value } = e.target;

			if (active === 0) {
				validateField(name, value, productService.step1Schema);
			} else if (active === 1) {
				validateField(name, value, productService.step2Schema);
			}

			if (e.target.name === "name") {
				setProductFormData((prev) => ({
					...prev,
					name: value,
					slug: slugify(value, { lower: true }),
				}));
			} else {
				setProductFormData((prev) => ({
					...prev,
					[name]: value,
				}));
			}
		} else {
			setProductFormData({
				...productFormData,
				productAttributes: productFormData.productAttributes.map(
					(attribute, index) => {
						return {
							property:
								e.target.name === `attribute-property-${index}`
									? e.target.value
									: attribute.property,
							description:
								e.target.name === `attribute-description-${index}`
									? e.target.value
									: attribute.description,
						};
					}
				),
			});
		}
	};

	const handleAddProduct = async () => {
		try {
			setLoading.open();
			if (!authToken) return logout();

			const response = await productService.createProduct(
				authToken,
				productFormData.name,
				productFormData.description,
				productFormData.basePrice,
				productFormData.minOrderQuantity as number,
				productFormData.pricingType,
				productFormData.categoryId === 0 ? null : productFormData.categoryId,
				productFormData.isActive,
				productFormData.productAttributes,
				productFormData.productTags,
				productFormData.variations,
				productFormData.variants,
				productFormData.discountStart,
				productFormData.discountEnd,
				productFormData.discountPercentage
			);

			if (response.status === 201) {
				const imageUploadResponse = await productService.createProductImage(
					authToken,
					response.data.product.productId,
					productFormData.productImages
				);

				if (imageUploadResponse.status === 200) {
					toast({
						description: response.message,
						variant: "success",
						duration: 10000,
					});
				}
			}
		} catch (err: any) {
			setLoading.close();
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	const handleEditProduct = async () => {
		try {
			if (!isEditMode || !product) {
				setIsEditMode(false);
				return;
			}

			setLoading.open();
			if (!authToken) return logout();

			const response = await productService.editProduct(
				authToken,
				product.productId,
				productFormData.name,
				productFormData.description,
				productFormData.basePrice,
				productFormData.minOrderQuantity as number,
				productFormData.pricingType,
				productFormData.categoryId === 0 ? null : productFormData.categoryId,
				productFormData.isActive,
				productFormData.productAttributes,
				productFormData.productTags,
				productFormData.variations,
				productFormData.variants,
				productFormData.discountStart,
				productFormData.discountEnd,
				productFormData.discountPercentage
			);

			if (response.status === 200) {
				const imageUploadResponse = await productService.editProductImage(
					authToken,
					product.productId,
					productFormData.productImages
				);

				if (imageUploadResponse.status === 200) {
					toast({
						description: response.message,
						variant: "success",
						duration: 10000,
					});
				}
			}
		} catch (err: any) {
			setLoading.close();
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title={isEditMode ? "Edit Product" : "Add New Product"}
				description="Follow these steps to add or edit a product in your store."
			></Header>

			{/* Stepper */}
			<Stepper
				active={active}
				onStepClick={setActive}
				allowNextStepsSelect={false}
				color="#24A9E2"
				size="sm"
				iconSize={32}
			>
				<Stepper.Step label="Basic Information">
					<ProductBasicInfoForm
						nextStep={nextStep}
						productFormData={productFormData}
						setProductFormData={setProductFormData}
						onChange={handleChange}
						errors={errors}
					/>
				</Stepper.Step>
				<Stepper.Step label="Pricing">
					<ProductPricingForm
						prevStep={prevStep}
						nextStep={nextStep}
						productFormData={productFormData}
						setProductFormData={setProductFormData}
						onChange={handleChange}
						errors={errors}
						validateField={validateField}
					/>
				</Stepper.Step>
				<Stepper.Step label="Variation">
					<ProductVariationForm
						prevStep={prevStep}
						nextStep={nextStep}
						productFormData={productFormData}
						setProductFormData={setProductFormData}
					/>
				</Stepper.Step>
				<Stepper.Step label="Image Selection">
					<ProductImageForm
						prevStep={prevStep}
						nextStep={nextStep}
						productFormData={productFormData}
						setProductFormData={setProductFormData}
					/>
				</Stepper.Step>
				<Stepper.Step label={isEditMode ? "Update" : "Publish"}>
					<ProductPublishForm
						prevStep={prevStep}
						productFormData={productFormData}
						setProductFormData={setProductFormData}
						handleSubmit={isEditMode ? handleEditProduct : handleAddProduct}
						isEditMode={isEditMode}
						loading={loading}
					/>
				</Stepper.Step>
			</Stepper>
		</section>
	);
};

export default AddProduct;

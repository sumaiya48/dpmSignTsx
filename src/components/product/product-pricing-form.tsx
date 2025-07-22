import React, { ChangeEvent, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { currencyCode } from "@/config";
import { productService } from "@/api";
import { ProductFormProps } from "@/pages/AddProduct";

export const ProductPricingForm = ({
	prevStep,
	nextStep,
	productFormData,
	setProductFormData,
	onChange,
	errors,
	validateField,
}: {
	prevStep: () => void;
	nextStep: () => void;
	productFormData: ProductFormProps;
	setProductFormData: React.Dispatch<SetStateAction<ProductFormProps>>;
	onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	errors: { [key: string]: any };
	validateField: (name: string, value: any, schema: any) => boolean;
}) => {
	return (
		<Card className="bg-slate-100/60 backdrop-blur-lg">
			<CardHeader>
				<CardTitle>Product Pricing</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="w-full flex items-baseline gap-4">
					<div className="space-y-2 my-4">
						<Label htmlFor="pricing-type" className="cursor-pointer">
							Select Pricing Type
							<span className="text-skyblue"> *</span>
						</Label>

						<Select
							value={productFormData.pricingType}
							onValueChange={(value) => {
								validateField("pricingType", value, productService.step2Schema);

								setProductFormData((prev) => ({
									...prev,
									pricingType: value,
								}));
							}}
						>
							<SelectTrigger
								error={errors.pricingType ? true : false}
								id="pricing-type"
								aria-labelledby="pricing-type-label"
								className="w-[200px]"
							>
								<SelectValue placeholder="Pricing Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="flat">Flat Price</SelectItem>
									<SelectItem value="square-feet">Square Feet Price</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						{errors.pricingType && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.pricingType}
							</p>
						)}
					</div>

					<div className="space-y-2 my-4">
						<Label htmlFor="base-price" className="cursor-pointer">
							Base Price ({currencyCode})
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="base-price"
							name="basePrice"
							type="number"
							className="input-type-number"
							value={productFormData.basePrice || ""}
							onChange={onChange}
							error={errors.basePrice ? true : false}
						/>

						{errors.basePrice && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.basePrice}
							</p>
						)}
					</div>

					<div className="space-y-2 my-4">
						<Label htmlFor="min-order-quantity" className="cursor-pointer">
							Minimum Order Quantity (piece)
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="min-order-quantity"
							name="minOrderQuantity"
							type="number"
							className="input-type-number"
							value={productFormData.minOrderQuantity || ""}
							onChange={onChange}
							error={errors.minOrderQuantity ? true : false}
						/>

						{errors.minOrderQuantity && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.minOrderQuantity}
							</p>
						)}
					</div>
				</div>

				<div className="w-full flex items-baseline gap-4">
					<div className="space-y-2 my-4">
						<Label htmlFor="discount-start" className="cursor-pointer">
							{productFormData.pricingType === "flat"
								? "Discount Start Quantity (piece)"
								: "Discount Start (sq.feet)"}
						</Label>
						<Input
							id="discount-start"
							name="discountStart"
							type="number"
							className="input-type-number"
							value={productFormData.discountStart || ""}
							onChange={onChange}
							error={errors.discountStart ? true : false}
						/>

						{errors.discountStart && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.discountStart}
							</p>
						)}
					</div>

					<div className="space-y-2 my-4">
						<Label htmlFor="discount-end" className="cursor-pointer">
							{productFormData.pricingType === "flat"
								? "Discount End Quantity (piece)"
								: "Discount End (sq.feet)"}
						</Label>
						<Input
							id="discount-end"
							name="discountEnd"
							type="number"
							className="input-type-number"
							value={productFormData.discountEnd || ""}
							onChange={onChange}
							error={errors.discountEnd ? true : false}
						/>

						{errors.discountEnd && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.discountEnd}
							</p>
						)}
					</div>

					<div className="space-y-2 my-4">
						<Label htmlFor="discount-percentage" className="cursor-pointer">
							Discount Percentage (%)
						</Label>
						<Input
							id="discount-percentage"
							name="discountPercentage"
							type="number"
							className="input-type-number"
							value={productFormData.discountPercentage || ""}
							onChange={onChange}
							error={errors.discountPercentage ? true : false}
						/>

						{errors.discountPercentage && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.discountPercentage}
							</p>
						)}
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="w-full flex items-start justify-between">
					<Button variant="outline" onClick={prevStep}>
						<ArrowLeft size={15} />
						Previous Step
					</Button>
					<Button onClick={nextStep}>
						Next Step <ArrowRight size={15} />
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
};

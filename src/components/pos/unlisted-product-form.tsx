import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { calculateSquareFeet, generateNumericUUID } from "@/lib/utils";

const UnlistedProductForm = () => {
	const { addToCart } = useCart();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [pricingType, setPricingType] = useState<"flat" | "square-feet">(
		"flat"
	);
	const [basePrice, setBasePrice] = useState<number>(0);
	const [quantity, setQuantity] = useState<number>(1);
	const [width, setWidth] = useState<number>(12);
	const [height, setHeight] = useState<number>(12);
	const [unit, setUnit] = useState<"feet" | "inches">("inches");
	const [sqFeet, setSqFeet] = useState<number | null>(null);

	// Calculate square feet whenever width, height, or unit changes
	useEffect(() => {
		setSqFeet(calculateSquareFeet(width, height, unit));
	}, [width, height, unit]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name || !basePrice || !quantity) {
			console.error("Please fill in all required fields");
			return;
		}

		if (isNaN(basePrice) || basePrice <= 0) {
			console.error("Please enter a valid price");
			return;
		}

		if (isNaN(quantity) || quantity < 1) {
			console.error("Please enter a valid quantity");
			return;
		}

		let finalPrice = basePrice;
		if (pricingType === "square-feet" && sqFeet !== null) {
			finalPrice = basePrice * sqFeet * quantity;
		} else {
			finalPrice = basePrice * quantity;
		}

		// Generate a numeric ID instead of a string
		const uniqueId = generateNumericUUID(6);

		const unlistedProduct = {
			productId: uniqueId,
			name,
			description,
			sku: `UNLISTED-${uniqueId}`,
			basePrice,
			pricingType,
			isActive: true,
			categoryId: 0,
			attributes: [],
			tags: [],
			images: [],
			variations: [],
			variants: [],
			minOrderQuantity: 1,
			discountStart: 0,
			discountEnd: 0,
			discountPercentage: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
			slug: `unlisted-${uniqueId}`,
			reviews: [],
		};

		addToCart({
			cartItemId: generateNumericUUID(6),
			product: unlistedProduct,
			unlistedProductId: unlistedProduct.productId,
			quantity,
			size: sqFeet,
			price: finalPrice,
			widthInch: width,
			heightInch: height,
		});

		// Reset form
		setName("");
		setDescription("");
		setPricingType("flat");
		setBasePrice(0);
		setQuantity(1);
		setWidth(12);
		setHeight(12);
		setUnit("inches");
		setSqFeet(calculateSquareFeet(width, height));

		console.log("Unlisted product added to cart");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Product Name *</Label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter product name"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Input
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Enter product description"
				/>
			</div>

			<div className="space-y-2">
				<Label>Pricing Type *</Label>
				<Select
					value={pricingType}
					onValueChange={(value: "flat" | "square-feet") =>
						setPricingType(value)
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select pricing type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="flat">Flat Rate</SelectItem>
						<SelectItem value="square-feet">Square Feet</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{pricingType === "square-feet" && (
				<div className="space-y-4">
					<div className="flex gap-4">
						<div className="flex-1 space-y-2">
							<Label htmlFor="width">Width *</Label>
							<Input
								className="input-type-number"
								id="width"
								type="number"
								min="0"
								step="0.01"
								value={width}
								onChange={(e) => setWidth(Number(e.target.value))}
								placeholder="Enter width"
								required
							/>
						</div>
						<div className="flex-1 space-y-2">
							<Label htmlFor="height">Height *</Label>
							<Input
								className="input-type-number"
								id="height"
								type="number"
								min="0"
								step="0.01"
								value={height}
								onChange={(e) => setHeight(Number(e.target.value))}
								placeholder="Enter height"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Unit</Label>
						<ToggleGroup
							type="single"
							value={unit}
							onValueChange={(value: "feet" | "inches") =>
								value && setUnit(value)
							}
							className="justify-start"
						>
							<ToggleGroupItem value="inches">in</ToggleGroupItem>
							<ToggleGroupItem value="feet">ft</ToggleGroupItem>
						</ToggleGroup>
					</div>

					{sqFeet !== null && (
						<div className="text-sm text-muted-foreground">
							Total Area: {sqFeet} sq ft
						</div>
					)}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="basePrice">Base Price *</Label>
				<Input
					className="input-type-number"
					id="basePrice"
					type="number"
					min="0"
					step="0.01"
					value={basePrice}
					onChange={(e) => setBasePrice(Number(e.target.value))}
					placeholder="Enter base price"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="quantity">Quantity *</Label>
				<Input
					className="input-type-number"
					id="quantity"
					type="number"
					min="1"
					value={quantity}
					onChange={(e) => setQuantity(Number(e.target.value))}
					placeholder="Enter quantity"
					required
				/>
			</div>

			<Button type="submit" className="w-full">
				Add to Cart
			</Button>
		</form>
	);
};

export default UnlistedProductForm;

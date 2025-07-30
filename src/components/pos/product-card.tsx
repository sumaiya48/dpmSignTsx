import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { ProductProps, VariantProps } from "@/hooks/use-product";
import {
	calculateSquareFeet,
	cn,
	formatPrice,
	generateNumericUUID,
} from "@/lib/utils";
import { currencyCode } from "@/config";
// import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
	product: ProductProps;
}

const ProductCard = ({ product }: ProductCardProps) => {
	const { addToCart } = useCart();
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [quantity, setQuantity] = useState(product?.minOrderQuantity || 1);
	const [designCharge, setDesignCharge] = useState<number>(
		product?.basePrice && product?.basePrice < 1000 ? 250 : 0
	);
	const [discountPercentage, setDiscountPercentage] = useState<number>(0);
	const [totalPrice, setTotalPrice] = useState<number>(
		product?.basePrice + designCharge || 0
	);
	const [unit, setUnit] = useState<"inches" | "feet">("inches");

	const [selectedVariationItems, setSelectedVariationItems] = useState<{
		[key: string]: {
			value: number | null;
			unit: string;
		};
	}>({});
	const [matchedVariant, setMatchedVariant] = useState<
		VariantProps | undefined
	>(undefined);

	useEffect(() => {
		// Find the variant that matches all selected variation items
		const matched = product?.variants.find((variant) =>
			variant.variantDetails.every((detail) => {
				const variation = product.variations.find((v) =>
					v.variationItems.some(
						(item) => item.variationItemId === detail.variationItemId
					)
				);
				if (!variation) return false;

				const selectedItem = selectedVariationItems[variation.name];
				return (
					selectedItem &&
					selectedItem.value === detail.variationItemId &&
					selectedItem.unit === variation.unit
				);
			})
		);

		setMatchedVariant(matched);
	}, [selectedVariationItems, product]);

	// useEffect(() => {
	// 	// setMatchedVariant(
	// 	// 	product?.variants.find((variant) =>
	// 	// 		variant.variantDetails.every((detail) => {
	// 	// 			return Object.values(selectedVariationItems).includes(
	// 	// 				detail.variationItemId
	// 	// 			);
	// 	// 		})
	// 	// 	)
	// 	// );

	// 	// setMatchedVariant(
	// 	// 	product?.variants.find((variant) =>
	// 	// 		variant.variantDetails.every((detail) => {
	// 	// 			const variation = {
	// 	// 				name: Object.keys(selectedVariationItems).find(
	// 	// 					(key) =>
	// 	// 						selectedVariationItems[key].value === detail.variationItemId
	// 	// 				),
	// 	// 				unit: Object.values(selectedVariationItems)
	// 	// 					.filter((item) => item.value === detail.variationItemId)
	// 	// 					.map((item) => item.unit),
	// 	// 			};

	// 	// 			return {
	// 	// 				...Object.values(selectedVariationItems).filter(
	// 	// 					(item) => item.value === detail.variationItemId
	// 	// 				),
	// 	// 				variation,
	// 	// 			};
	// 	// 		})
	// 	// 	)
	// 	// );

	// 	const m = product?.variants.find((variant) =>
	// 		variant.variantDetails.map((detail) => {
	// 			const variation = {
	// 				name: Object.keys(selectedVariationItems).find(
	// 					(key) =>
	// 						selectedVariationItems[key].value === detail.variationItemId
	// 				),
	// 				unit: Object.values(selectedVariationItems)
	// 					.filter((item) => item.value === detail.variationItemId)
	// 					.map((item) => item.unit)[0],
	// 			};
	// 			console.log(variation);

	// 			const result = {
	// 				variation,
	// 				...Object.values(selectedVariationItems).filter(
	// 					(item) => item.value === detail.variationItemId
	// 				),
	// 			};

	// 			console.log("result ", result);

	// 			return result;
	// 		})
	// 	);

	// 	setMatchedVariant(m);
	// 	console.log(m);
	// }, [selectedVariationItems]);

	const [width, setWidth] = useState<number>(12); // Default 12 inches
	const [height, setHeight] = useState<number>(12); // Default 12 inches
	const [sqFeet, setSqFeet] = useState<number>(
		calculateSquareFeet(width, height, unit)
	);

	useEffect(() => {
		setSqFeet(calculateSquareFeet(width, height, unit));
	}, [width, height, unit]);

	useEffect(() => {
		if (isDetailsOpen) {
			// Reset selections when dialog opens
			setQuantity(product.minOrderQuantity);
			setSelectedVariationItems({});
			setMatchedVariant(undefined);
			setWidth(12);
			setHeight(12);
			setSqFeet(calculateSquareFeet(width, height));
			setQuantity(product?.minOrderQuantity || 1);
		}
	}, [isDetailsOpen, product.minOrderQuantity]);

	const calculateFinalPricing = (
		product: ProductProps,
		matchedVariant: VariantProps,
		basis: number
	): {
		basis: number;
		basePriceTotal: number | null;
		appliedDiscountPercentage: number | null;
		discountedPriceTotal: number | null;
	} => {
		const {
			basePrice,
			discountStart,
			discountEnd,
			discountPercentage: maxDiscount,
		} = product;

		if (!basePrice || !discountStart || !discountEnd || !maxDiscount)
			return {
				basis,
				basePriceTotal: null,
				appliedDiscountPercentage: null,
				discountedPriceTotal: null,
			};

		// Base total price
		const basePriceTotal = parseFloat(
			(basis * (basePrice + matchedVariant.additionalPrice)).toFixed(2)
		);

		// Calculate linear discount percentage
		let appliedDiscountPercentage: number = 0;
		if (basis >= discountStart) {
			if (basis <= discountEnd) {
				// inclusive scaling: discount applies starting exactly at discountStart
				const rangeLength = discountEnd - discountStart + 1;
				const stepIndex = basis - discountStart + 1;
				appliedDiscountPercentage = parseFloat(
					((maxDiscount * stepIndex) / rangeLength).toFixed(2)
				);
			} else {
				appliedDiscountPercentage = parseFloat(maxDiscount.toString());
			}
		}

		// Compute discounted total
		const discountedPriceTotal = Math.floor(
			parseFloat(
				(basePriceTotal * (1 - appliedDiscountPercentage / 100)).toFixed(2)
			)
		);

		return {
			basis,
			basePriceTotal,
			appliedDiscountPercentage,
			discountedPriceTotal,
		};
	};

	useEffect(() => {
		if (product && matchedVariant) {
			if (product.pricingType === "flat") {
				const { appliedDiscountPercentage, discountedPriceTotal } =
					calculateFinalPricing(product, matchedVariant, quantity);

				if (!discountedPriceTotal) return;

				setDiscountPercentage(appliedDiscountPercentage || 0);

				const newDesignCharge =
					discountedPriceTotal > 1000
						? 0
						: product?.basePrice && product?.basePrice < 1000
						? 250
						: 0;

				setDesignCharge(newDesignCharge);

				setTotalPrice(Math.floor(discountedPriceTotal + designCharge));
			} else if (product.pricingType === "square-feet") {
				const { appliedDiscountPercentage, discountedPriceTotal } =
					calculateFinalPricing(product, matchedVariant, sqFeet);
				if (!discountedPriceTotal) return;

				setDiscountPercentage(appliedDiscountPercentage || 0);

				const newDesignCharge =
					discountedPriceTotal * quantity > 1000
						? 0
						: product?.basePrice && product?.basePrice < 1000
						? 250
						: 0;

				setDesignCharge(newDesignCharge);

				setTotalPrice(
					Math.floor(discountedPriceTotal * quantity + designCharge)
				);
			}
		}
	}, [
		selectedVariationItems,
		quantity,
		sqFeet,
		designCharge,
		matchedVariant,
		product,
	]);

	const handleIncreaseQuantity = () => {
		// if (selectedVariations.length) {
		if (matchedVariant) {
			setQuantity((prev) => prev + 1);
		}
	};

	const handleDecreaseQuantity = () => {
		if (quantity > product.minOrderQuantity && matchedVariant) {
			setQuantity((prev) => prev - 1);
		}
	};

	const handleVariationSelection = (
		// variationId: number,
		variationName: string,
		variationUnit: string,
		variationItemId: number
	) => {
		setSelectedVariationItems((prevData) => ({
			...prevData,
			[variationName]: {
				value: variationItemId,
				unit: variationUnit,
			},
		}));
	};

	const handleAddToCart = () => {
		if (!matchedVariant || !product) return;
		// Find the selected variant if it exists (matching all selected variations)
		// const selectedVariant = product.variants.find((variant) => {
		// 	// Check if all selected variations match this variant
		// 	return selectedVariations.every((selection) => {
		// 		return variant.variantDetails.some(
		// 			(detail) => detail.variationItemId === selection.variationItemId
		// 		);
		// 	});
		// });

		// Add to cart
		// addToCart({
		// 	id: 1,
		// 	product,
		// 	quantity,
		// 	// customText,
		// 	// selectedVariations,
		// 	// selectedVariant,
		// 	price: totalPrice, // Store the unit price
		// });
		addToCart({
			cartItemId: generateNumericUUID(6),
			product,
			productId: product.productId,
			productVariantId: matchedVariant?.productVariantId,
			productVariant: matchedVariant,
			quantity,
			size: sqFeet,
			price: totalPrice,
			widthInch: 12,
			heightInch: 12,
		});

		// Reset and close
		setIsDetailsOpen(false);
	};

	const handleCardClick = () => {
		setIsDetailsOpen(true);
	};

	return (
		<>
			<div
				className="w-44 bg-white rounded-xl overflow-hidden border border-neutral-500/30 cursor-pointer"
				onClick={handleCardClick}
			>
				<div className="w-full overflow-hidden relative">
					<img
						src={product.images[0].imageUrl}
						alt={product.name || product.sku}
						className="w-44 h-44 object-cover transition-transform duration-500 hover:scale-105"
						loading="lazy"
					/>
					{/* <div className="absolute bottom-2 right-2"> */}
	<div className="w-full absolute bottom-2 left-0 flex justify-between px-2">
	<span className="bg-green-500 text-white text-[10px] px-2 py-[2px] rounded font-medium">
		{product.sku}
	</span>
	<span className="bg-skyblue text-white text-[10px] px-2 py-[2px] rounded font-medium">
		{product.basePrice.toLocaleString()} {currencyCode}
	</span>
</div>



				</div>
				<div className="p-2 py-2">
					<h3 className="font-medium text-sm truncate">
						{product.name || product.sku}
					</h3>
					<p className="text-xs text-muted-foreground mt-1">
						{product.description.slice(0, 40)}
					</p>
				</div>
			</div>

			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="sm:max-w-[800px] max-h-[70vh] overflow-y-scroll">
					<DialogHeader>
						<DialogTitle className="text-xl">
							{product.name || product.sku}
						</DialogTitle>
						{/* <DialogDescription>{product.description}</DialogDescription> */}
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="w-full h-96 overflow-hidden rounded-lg">
							<img
								src={product.images[0].imageUrl}
								alt={product.name || product.sku}
								className="w-full h-full object-cover object-center"
							/>
						</div>

						{/* Variation Selection UI */}
						{product.variations.length > 0 && (
							<div className="">
								<div className="w-full flex items-center justify-between py-2">
									<p className="text-base font-medium">
										Total options:{" "}
										{product.variations.map((productVariation, i) => (
											<span key={i} className="font-semibold">
												{productVariation?.variationItems.length}{" "}
												{productVariation?.name}
												{i < product.variations.length - 1 ? ", " : ""}
											</span>
										))}
									</p>
								</div>

								{product.variations.map((productVariation, index) => (
									<div
										key={productVariation.variationId}
										className="w-full py-2 flex items-start justify-center gap-2 flex-col flex-wrap"
									>
										<h5 className="text-base font-medium">
											Step {index + 1}:{" "}
											<span className="font-normal">
												Select {productVariation?.name}
											</span>
										</h5>
										<div className="w-full flex items-start justify-start gap-2 flex-wrap">
											{productVariation?.variationItems.map((item) => (
												<Button
													key={item.variationItemId}
													size="sm"
													variant={
														selectedVariationItems[productVariation.name]
															?.value === item.variationItemId
															? "default"
															: "outline"
													}
													// variant={
													// 	selectedVariationItems[productVariation.name] ===
													// 	item.variationItemId
													// 		? "default"
													// 		: "outline"
													// }
													onClick={() =>
														handleVariationSelection(
															productVariation.name,
															productVariation.unit,
															item.variationItemId
														)
													}
												>
													{item.value} {productVariation.unit}
												</Button>
											))}
										</div>
									</div>
								))}
							</div>
						)}

						{/* product size dimension if the product is square feet pricing type */}
						{product.pricingType === "square-feet" && (
							<div className="flex flex-col gap-4 items-start py-2 pb-3">
								<div className="w-full flex gap-4 items-start justify-between py-2 pb-3">
									<h5 className="flex-1 text-sm xl:text-lg font-medium">
										Step {product.variations.length + 1}:{" "}
										<span className="font-normal">
											Select Size Dimension <br /> (Width × Height)
										</span>
									</h5>
								</div>

								<div className="w-full flex gap-4 items-center">
									<div className="flex-1 flex items-center gap-4">
										<div className="flex-1 flex items-center gap-2">
											<Input
												type="number"
												min={unit === "feet" ? 0.08 : 1} // Minimum 1 inch or 0.08 feet
												step={unit === "feet" ? 0.01 : 1}
												className="w-24 input-type-number"
												value={width}
												onChange={(e) => {
													if (matchedVariant) {
														setWidth(Math.round(Number(e.target.value)));
													}
												}}
												placeholder="Width"
											/>
											<span className="text-sm text-muted-foreground">×</span>
											<Input
												type="number"
												min={unit === "feet" ? 0.08 : 1}
												step={unit === "feet" ? 0.01 : 1}
												className="w-24 input-type-number"
												value={height}
												onChange={(e) => {
													if (matchedVariant) {
														setHeight(Math.round(Number(e.target.value)));
													}
												}}
												placeholder="Height"
											/>

											<ToggleGroup
												type="single"
												value={unit}
												onValueChange={(value) =>
													value && setUnit(value as any)
												}
												className="border border-gray/50 rounded-md"
											>
												<ToggleGroupItem
													value="inches"
													aria-label="Toggle inches"
													className="px-3 text-sm"
												>
													in
												</ToggleGroupItem>
												<ToggleGroupItem
													value="feet"
													aria-label="Toggle feet"
													className="px-3 text-sm"
												>
													ft
												</ToggleGroupItem>
											</ToggleGroup>

											<span className="text-sm text-muted-foreground">
												{unit}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">=</span>
											<span className="font-medium">{sqFeet} sq. ft</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Product Quantity */}
						<div className="flex items-center space-x-4">
							<h5 className="text-base font-medium">
								Step{" "}
								{product.pricingType === "flat"
									? product.variations.length + 1
									: product.variations.length + 2}
								: <span className="font-normal">Select Quantity</span>
							</h5>
							<div className="w-36 h-auto border border-neutral-500/30 px-3 rounded-md relative flex items-center justify-center gap-0">
								<Minus
									size={15}
									className="cursor-pointer transition-all duration-300 hover:text-primary"
									onClick={handleDecreaseQuantity}
								/>
								<Input
									type="number"
									min={product.minOrderQuantity}
									className="w-20 py-0 px-0 border-0 text-center pl-0 input-type-number"
									value={quantity}
									onChange={(e) => {
										if (matchedVariant && Number(e.target.value) > 0) {
											setQuantity(Number(e.target.value));
										}
									}}
								/>
								<Plus
									size={15}
									className="cursor-pointer transition-all duration-300 hover:text-primary"
									onClick={handleIncreaseQuantity}
								/>
							</div>
						</div>

						{/* Price breakdown */}
						<div className="text-base font-medium space-y-1 border-t border-neutral-500/30 pt-2">
							<div className="flex justify-between">
								<span>Unit Price:</span>
								<span>
									{formatPrice(product.basePrice)} {currencyCode}
								</span>
							</div>

							<div className="flex justify-between">
								<span>Additional Price:</span>
								<span>
									{matchedVariant?.additionalPrice
										? formatPrice(matchedVariant.additionalPrice)
										: 0}{" "}
									{currencyCode}
								</span>
							</div>

							<div
								className={cn(
									"flex justify-between",
									product.pricingType === "flat" &&
										product.discountStart &&
										quantity >= product.discountStart &&
										"text-green-500",
									product.pricingType === "square-feet" &&
										product.discountStart &&
										sqFeet >= product.discountStart &&
										"text-green-500"
								)}
							>
								<span>Discount:</span>
								<span>{discountPercentage}%</span>
							</div>

							<div className="flex justify-between">
								<span>Design Charge:</span>
								<span>
									{designCharge ? formatPrice(designCharge) : 0} {currencyCode}
								</span>
							</div>

							{/* <Separator className="h-[1px] bg-neutral-500/30" /> */}
						</div>

						<div className="text-base font-medium space-y-1 border-t border-neutral-500/30 pt-2">
							<div className="flex justify-between">
								<span>Total:</span>
								<span>
									{formatPrice(totalPrice)} {currencyCode}
								</span>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={() => setIsDetailsOpen(false)} variant="outline">
							Cancel
						</Button>
						<Button
							onClick={handleAddToCart}
							disabled={matchedVariant ? false : true}
						>
							<ShoppingCart />
							Add to Cart
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ProductCard;

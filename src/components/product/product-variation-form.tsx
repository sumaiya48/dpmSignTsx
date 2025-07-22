import React, { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
	CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Plus, Wand2 } from "lucide-react";
import VariantPriceForm from "@/components/product/variant-price-form";
import VariationForm from "@/components/product/variation-form";
import { generateVariants } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ProductFormProps,
	Variant,
	Variation,
	VariationItem,
} from "@/pages/AddProduct";

export const ProductVariationForm = ({
	prevStep,
	nextStep,
	productFormData,
	setProductFormData,
}: {
	prevStep: () => void;
	nextStep: () => void;
	productFormData: ProductFormProps;
	setProductFormData: React.Dispatch<SetStateAction<ProductFormProps>>;
}) => {
	const { toast } = useToast();
	const [nextVariationId, setNextVariationId] = useState(1);
	const [nextItemId, setNextItemId] = useState(1);
	const [variantsGenerated, setVariantsGenerated] = useState<boolean>(
		productFormData.variants.length > 0 || false
	);

	if (!productFormData.basePrice) prevStep();

	// Add a new variation
	const handleAddVariation = () => {
		const newVariation: Variation = {
			id: nextVariationId,
			name: "",
			unit: "",
			variationItems: [],
		};

		setProductFormData({
			...productFormData,
			variations: [...productFormData.variations, newVariation],
		});

		setNextVariationId(nextVariationId + 1);
	};

	// Update variation
	const handleVariationChange = (id: number, updates: Partial<Variation>) => {
		setProductFormData({
			...productFormData,
			variations: productFormData.variations.map((v) =>
				v.id === id ? { ...v, ...updates } : v
			),
		});
	};

	// Add a new item to a variation
	const handleAddItem = (variationId: number, value: string) => {
		const newItem: VariationItem = {
			id: nextItemId,
			value,
		};

		setProductFormData({
			...productFormData,
			variations: productFormData.variations.map((v) =>
				v.id === variationId
					? { ...v, variationItems: [...v.variationItems, newItem] }
					: v
			),
		});

		setNextItemId(nextItemId + 1);
	};

	// Remove an item from a variation
	const handleRemoveItem = (variationId: number, itemId: number) => {
		setProductFormData({
			...productFormData,
			variations: productFormData.variations.map((v) =>
				v.id === variationId
					? {
							...v,
							variationItems: v.variationItems.filter(
								(item) => item.id !== itemId
							),
					  }
					: v
			),
		});
	};

	// Remove a variation
	const handleRemoveVariation = (id: number) => {
		setProductFormData({
			...productFormData,
			variations: productFormData.variations.filter((v) => v.id !== id),
			variants: [],
		});
	};

	// Generate all possible product variants
	const handleGenerateVariants = () => {
		// Validate variations
		if (productFormData.variations.length === 0) {
			toast({
				title: "No variations",
				description: "Please add at least one variation with items.",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		const emptyVariations = productFormData.variations.filter(
			(v) => v.name.trim() === "" || v.variationItems.length === 0
		);

		if (emptyVariations.length > 0) {
			toast({
				title: "Incomplete variations",
				description:
					"Please ensure all variations have names and at least one item.",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		// Generate variants
		const variants = generateVariants(productFormData.variations);

		setProductFormData({
			...productFormData,
			variants,
		});

		setVariantsGenerated(true);

		toast({
			title: "Variants generated",
			description: `${variants.length} product variants have been created.`,
			duration: 3000,
		});
	};

	// Update a variant's properties
	const handleVariantChange = (id: number, updates: Partial<Variant>) => {
		setProductFormData({
			...productFormData,
			variants: productFormData.variants.map((variant) =>
				variant.id === id ? { ...variant, ...updates } : variant
			),
		});
	};

	return (
		<Card className="bg-slate-100/60 backdrop-blur-lg">
			<CardHeader>
				<CardTitle className="text-2xl font-medium">
					Product Variations
				</CardTitle>
				<CardDescription>
					Add all the variations of your product, like color, size, material,
					etc. After adding variations, generate all possible combinations by
					clicking the "Generate Variants" button.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{productFormData.variations.map((variation) => (
						<VariationForm
							key={variation.id}
							variation={variation}
							onVariationChange={handleVariationChange}
							onAddItem={handleAddItem}
							onRemoveItem={handleRemoveItem}
							onRemoveVariation={handleRemoveVariation}
						/>
					))}
				</div>

				<div className="flex flex-wrap gap-4">
					<Button variant="outline" onClick={handleAddVariation}>
						<Plus />
						Add Variation
					</Button>

					<Button
						onClick={handleGenerateVariants}
						disabled={productFormData.variations.length === 0}
					>
						<Wand2 />
						Generate Variants
					</Button>
				</div>
			</CardContent>

			{variantsGenerated && productFormData.variants.length > 0 && (
				<>
					<CardHeader>
						<CardTitle className="text-2xl font-medium">
							Product Variants
						</CardTitle>
						<CardDescription>
							Adjust additional prices and stock quantities for all generated
							product variants.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-[500px] pr-4 custom-scrollbar">
							<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
								{productFormData.variants.map((variant) => (
									<VariantPriceForm
										key={variant.id}
										variant={variant}
										basePrice={productFormData.basePrice as number}
										onChange={handleVariantChange}
									/>
								))}
							</div>
						</ScrollArea>
					</CardContent>
				</>
			)}

			<CardFooter>
				<div className="w-full flex items-start justify-between">
					<Button variant="outline" onClick={prevStep}>
						<ArrowLeft size={15} />
						Previous Step
					</Button>
					<Button
						disabled={productFormData.variants.length === 0}
						onClick={nextStep}
					>
						Next Step
						<ArrowRight size={15} />
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
};

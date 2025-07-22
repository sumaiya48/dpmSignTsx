import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Variant } from "@/pages/AddProduct";

interface VariantPriceFormProps {
	variant: Variant;
	basePrice: number;
	onChange: (id: number, updates: Partial<Variant>) => void;
}

const VariantPriceForm = ({
	variant,
	basePrice,
	onChange,
}: VariantPriceFormProps) => {
	const getColorForVariation = (value: string): string => {
		// Simple hash function to generate consistent colors for variation values
		const hash = value
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const hue = hash % 360;
		return `hsl(${hue}, 70%, 96%)`;
	};

	const getTextColorForVariation = (value: string): string => {
		// Simple hash function to generate consistent text colors for variation values
		const hash = value
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const hue = hash % 360;
		return `hsl(${hue}, 70%, 35%)`;
	};

	const handleAdditionalPriceChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value);
		onChange(variant.id, { additionalPrice: value });
	};

	return (
		<Card className="w-full overflow-hidden border border-neutral-500/50 shadow-sm bg-slate-100/60 backdrop-blur-lg">
			<CardHeader className="p-4 pb-2">
				<div className="flex items-center gap-2 flex-wrap">
					{variant.variantDetails.map((detail, index) => (
						<Badge
							key={index}
							size="sm"
							style={{
								backgroundColor: getColorForVariation(
									detail.variationItemValue
								),
								color: getTextColorForVariation(detail.variationItemValue),
								borderColor: getTextColorForVariation(
									detail.variationItemValue
								),
							}}
						>
							{detail.variationName}: {detail.variationItemValue}
						</Badge>
					))}
				</div>
			</CardHeader>
			<CardContent className="w-full p-4 pt-2">
				<div className="w-full ">
					<div className="space-y-2 w-full">
						<div className="w-full flex flex-col gap-2">
							<Label htmlFor={`additional-price-${variant.id}`}>
								Additional Price
							</Label>
							<Input
								id={`additional-price-${variant.id}`}
								type="number"
								className="input-type-number"
								value={variant.additionalPrice || ""}
								onChange={handleAdditionalPriceChange}
								placeholder="0"
							/>
						</div>
						<p className="text-xs text-neutral-600">
							Final: {Number(basePrice) + Number(variant.additionalPrice || 0)}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default VariantPriceForm;

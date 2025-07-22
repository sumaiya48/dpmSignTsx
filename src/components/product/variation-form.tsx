import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import VariationItem from "@/components/product/variation-item";
import { Variation } from "@/pages/AddProduct";

interface VariationFormProps {
	variation: Variation;
	onVariationChange: (id: number, updates: Partial<Variation>) => void;
	onAddItem: (variationId: number, item: string) => void;
	onRemoveItem: (variationId: number, itemId: number) => void;
	onRemoveVariation: (id: number) => void;
}

const VariationForm: React.FC<VariationFormProps> = ({
	variation,
	onVariationChange,
	onAddItem,
	onRemoveItem,
	onRemoveVariation,
}) => {
	const [newItem, setNewItem] = useState("");

	const handleAddItem = (e: React.FormEvent) => {
		e.preventDefault();
		if (newItem.trim()) {
			onAddItem(variation.id, newItem);
			setNewItem("");
		}
	};

	return (
		<Card className="w-full overflow-hidden border border-neutral-500/50 shadow-sm bg-slate-100/60 backdrop-blur-lg">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between gap-2 my-2">
					<Button
						variant="destructive"
						size="sm"
						onClick={() => onRemoveVariation(variation.id)}
					>
						Remove
					</Button>
				</div>
				<div className="w-full grid grid-cols-2 gap-2">
					<div>
						<Label htmlFor={`variation-name-${variation.id}`}>
							Variation Name
						</Label>
						<Input
							id={`variation-name-${variation.id}`}
							value={variation.name}
							onChange={(e) =>
								onVariationChange(variation.id, { name: e.target.value })
							}
							placeholder="e.g. Color, Size"
						/>
					</div>
					<div>
						<Label htmlFor={`variation-unit-${variation.id}`}>
							Unit (optional)
						</Label>
						<Input
							id={`variation-unit-${variation.id}`}
							value={variation.unit || ""}
							onChange={(e) =>
								onVariationChange(variation.id, { unit: e.target.value })
							}
							placeholder="e.g. cm, inches"
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				<Separator className="bg-neutral-500/50" />
				<div className="flex flex-wrap gap-2 my-2 min-h-10">
					{variation.variationItems.length > 0 ? (
						variation.variationItems.map((item) => (
							<VariationItem
								key={item.id}
								item={item}
								onRemove={(itemId) => onRemoveItem(variation.id, itemId)}
							/>
						))
					) : (
						<p className="text-xs text-neutral-600">
							No items added yet. Add some items below.
						</p>
					)}
				</div>
				<form onSubmit={handleAddItem} className="flex items-end gap-2">
					<div className="flex-1">
						<Label htmlFor={`item-${variation.id}`}>Add New Item</Label>
						<Input
							id={`item-${variation.id}`}
							value={newItem}
							onChange={(e) => setNewItem(e.target.value)}
							placeholder="Enter item value"
						/>
					</div>
					<Button size="sm">
						<Plus />
						Add
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default VariationForm;

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariationItem as VariationItemType } from "@/pages/AddProduct";

interface VariationItemProps {
	item: VariationItemType;
	onRemove: (id: number) => void;
	className?: string;
}

const VariationItem: React.FC<VariationItemProps> = ({
	item,
	onRemove,
	className,
}) => {
	return (
		<div
			className={cn(
				"group animate-scale-in flex items-center gap-1 py-1 px-2 rounded-md bg-secondary border border-border",
				"hover:border-primary/20 transition-all",
				className
			)}
		>
			<span className="text-sm font-medium">{item.value}</span>
			<Button
				variant="ghost"
				size="icon"
				className="h-5 w-5 rounded-full opacity-50 group-hover:opacity-100"
				onClick={() => onRemove(item.id)}
			>
				<X className="h-3 w-3" />
				<span className="sr-only">Remove item</span>
			</Button>
		</div>
	);
};

export default VariationItem;

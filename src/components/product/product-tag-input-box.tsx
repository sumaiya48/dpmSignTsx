import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFormProps } from "@/pages/AddProduct";
import { SetStateAction, useState } from "react";
import { X } from "lucide-react";

export const ProductTag = ({
	productFormData,
	setProductFormData,
}: {
	productFormData: ProductFormProps;
	setProductFormData: React.Dispatch<SetStateAction<ProductFormProps>>;
}) => {
	const [inputValue, setInputValue] = useState<string>("");

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			// Changed " " to "Enter"
			e.preventDefault();
			const newTag = inputValue.trim();
			if (!productFormData.productTags.includes(newTag)) {
				setProductFormData((prevData) => ({
					...prevData,
					productTags: [...prevData.productTags, newTag], // Use prevData here
				}));
			}
			setInputValue("");
		} else if (
			e.key === "Backspace" &&
			!inputValue &&
			productFormData.productTags.length > 0
		) {
			setProductFormData((prevData) => ({
				...prevData,
				productTags: prevData.productTags.slice(0, -1),
			}));
		}
	};

	const removeTag = (tagToRemove: string) => {
		setProductFormData((prevData) => ({
			...prevData,
			productTags: productFormData.productTags.filter(
				(tag) => tag !== tagToRemove
			),
		}));
	};

	return (
		<div className="w-full flex flex-col items-baseline gap-3">
			<Label htmlFor="product-tags">Product Tags</Label>
			<div className="w-full flex-1 flex flex-wrap gap-2 min-h-[42px] rounded-md">
				<Input
					id="product-tags"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value.toLowerCase())}
					onKeyDown={handleKeyDown}
					placeholder="Type and press space to add tags..."
				/>

				{productFormData.productTags.map((tag) => (
					<Button
						key={tag}
						onClick={() => removeTag(tag)}
						variant="greenlight"
						size="sm"
					>
						{tag}
						<X className="h-3 w-3" />
					</Button>
				))}
			</div>
		</div>
	);
};

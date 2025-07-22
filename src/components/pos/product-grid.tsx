import ProductCard from "@/components/pos/product-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ProductProps } from "@/hooks/use-product";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import UnlistedProductForm from "./unlisted-product-form";

interface ProductGridProps {
	products: ProductProps[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [searchBy, setSearchBy] = useState("name");
	const [showUnlistedForm, setShowUnlistedForm] = useState(false);

	// Filter products based on search term and category
	const filteredProducts = products.filter((product) => {
		// Search in name, sku, or description
		const matchesSearch =
			(product.name &&
				product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(searchBy === "sku" &&
				product.sku &&
				product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(product.description &&
				product.description.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesSearch;
	});

	return (
		<div className="space-y-4 h-full flex flex-col">
			<div className="flex w-full gap-3 items-center pr-2">
				<div className=" w-72 relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4" />
					<Input
						type="search"
						placeholder={`Search by product ${searchBy}`}
						className="pl-9  w-full"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="flex justify-between items-center gap-2">
					<Select onValueChange={(e) => setSearchBy(e as any)}>
						<SelectTrigger className="w-[150px]" defaultValue={searchBy}>
							<SelectValue placeholder="Search By" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="sku">SKU</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="flex justify-between items-center gap-2">
					<Toggle
						pressed={showUnlistedForm}
						onPressedChange={setShowUnlistedForm}
						className="h-9 px-3"
						aria-label="Add unlisted product"
					>
						<Plus className="h-4 w-4" />
						{showUnlistedForm ? "Add Listed Product" : "Add Unlisted Product"}
					</Toggle>
				</div>
			</div>

			<div className="flex-1 overflow-auto ">
				{showUnlistedForm ? (
					<UnlistedProductForm />
				) : filteredProducts.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">No products found</p>
					</div>
				) : (
					<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 flex-wrap gap-4">
						{filteredProducts.map((product) => (
							<ProductCard key={product.productId} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductGrid;

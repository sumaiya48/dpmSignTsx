import { SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LoadingOverlay } from "@mantine/core";
import { useCategory } from "@/hooks/use-category";
import { currencyCode } from "@/config";
import { ProductFormProps } from "@/pages/AddProduct";

export const ProductPublishForm = ({
	prevStep,
	productFormData,
	setProductFormData,
	handleSubmit,
	isEditMode,
	loading,
}: {
	prevStep: () => void;
	productFormData: ProductFormProps;
	setProductFormData: React.Dispatch<SetStateAction<ProductFormProps>>;
	handleSubmit: () => void;
	isEditMode: boolean;
	loading: boolean;
}) => {
	const { categories } = useCategory();

	return (
		<Card className="bg-slate-100/60 backdrop-blur-lg">
			<CardHeader>
				<CardTitle>{isEditMode ? "Publish" : "Update"}</CardTitle>
			</CardHeader>
			<CardContent>
				{loading && (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				)}

				<div className="space-y-4">
					{/* product name */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">Product Name</Label>
						<Input value={productFormData.name} readOnly={true} />
					</div>

					{/* product slug */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">Product Slug</Label>
						<Input value={productFormData.slug} readOnly={true} />
					</div>

					{/* product tags */}
					<div className="w-full flex flex-col gap-3">
						<Label className="cursor-pointer">Product Tags</Label>
						<div className="space-x-2">
							{productFormData.productTags.map((productTag, index) => (
								<Button key={index} variant="outline" size="xs">
									{productTag}
								</Button>
							))}
						</div>
					</div>

					{/* product description */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">Product Description</Label>
						<Textarea
							value={productFormData.description}
							readOnly={true}
							rows={8}
						/>
					</div>

					{/* product category */}
					<div className="space-y-1 my-4">
						<Label className="cursor-pointer">Product Category</Label>
						<p className="text-sm">
							{categories.filter(
								(category) => category.categoryId === productFormData.categoryId
							)[0]?.name || "N/A"}
						</p>
					</div>

					{/* product attributes */}
					{productFormData.productAttributes.length > 0 && (
						<div className="w-full space-y-2 my-4">
							<Table className="border-collapse mt-4">
								<TableHeader className="text-sm">
									<TableRow>
										<TableHead className="bg-skyblue text-white border-[2px] border-white px-8 w-1/3">
											Property
										</TableHead>
										<TableHead className="bg-skyblue text-white border-[2px] border-white px-8">
											Description
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody className="text-sm">
									{productFormData.productAttributes.map((attribute, index) => (
										<TableRow key={index} className="border-gray/60">
											<TableCell className="px-8 w-1/3">
												{attribute.property}
											</TableCell>
											<TableCell className="px-8">
												{attribute.description}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* product pricing */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">
							Base Price ({currencyCode})
						</Label>
						<Input value={productFormData.basePrice} readOnly={true} />
					</div>

					{/* product minimum order quantity */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">
							Minimum Order Quantity (piece)
						</Label>
						<Input value={productFormData.minOrderQuantity} readOnly={true} />
					</div>

					{/* product pricing type */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">Product Pricing Type</Label>
						<p className="text-sm">{productFormData.pricingType}</p>
					</div>

					{/* product status */}
					<div className="space-y-2 my-4">
						<Label className="cursor-pointer">Publish Status</Label>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="isActive"
								checked={productFormData.isActive}
								onCheckedChange={(checked) => {
									setProductFormData((prevData) => ({
										...prevData,
										isActive: checked as boolean,
									}));
								}}
							/>
							<Label htmlFor="isActive" className="cursor-pointer">
								Activate product. (or uncheck this if you save this product as
								unpublish.)
							</Label>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="w-full flex items-start justify-between">
					<Button variant="outline" onClick={prevStep}>
						<ArrowLeft size={15} />
						Previous Step
					</Button>
					<Button onClick={handleSubmit}>
						{isEditMode ? "Update" : "Publish"} <ArrowRight size={15} />
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
};

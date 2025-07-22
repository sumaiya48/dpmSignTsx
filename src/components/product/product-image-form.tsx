import React, { ChangeEvent, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Trash, Upload } from "lucide-react";
import { ProductFormProps } from "@/pages/AddProduct";

export const ProductImageForm = ({
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
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);

			setProductFormData({
				...productFormData,
				productImages: [...productFormData.productImages, ...files],
			});
		}
	};

	return (
		<Card className="bg-slate-100/60 backdrop-blur-lg">
			<CardHeader>
				<CardTitle>Image Upload</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Label
						className="relative w-full h-40 border-dashed border-[3px] border-gray/30 hover:border-skyblue/80 transition-all duration-300 cursor-pointer rounded-lg flex items-start justify-center flex-col gap-1.5"
						htmlFor="product-images"
					>
						<Input
							id="product-images"
							type="file"
							multiple
							accept="image/*"
							className="w-full h-full pointer-events-none hidden"
							onChange={handleFileChange}
							name="productImages"
						/>
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 flex items-center justify-center flex-col gap-3">
							<Upload />
							<span className="text-sm cursor-pointer">
								Click to upload product images.
							</span>
						</div>
					</Label>

					{productFormData.productImages && (
						<div className="w-full h-auto grid grid-cols-5 gap-2">
							{productFormData.productImages.map((productImage, index) => (
								<div
									key={index}
									className="flex items-start justify-center flex-col gap-2 overflow-hidden"
								>
									<img
										className="w-36 h-36 rounded-md"
										src={URL.createObjectURL(productImage)}
										alt="Not Found"
									/>

									<Button
										size="sm"
										variant="destructive"
										onClick={() => {
											setProductFormData((prevData) => ({
												...prevData,
												productImages: prevData.productImages.filter(
													(_, itemIndex) => itemIndex != index
												),
											}));
										}}
									>
										<Trash />
										Remove
									</Button>
								</div>
							))}
						</div>
					)}
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

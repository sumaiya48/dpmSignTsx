import React, {
	ChangeEvent,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowRight,
	Check,
	ChevronsUpDown,
	CirclePlus,
	Minus,
	Plus,
} from "lucide-react";
import { ProductTag } from "@/components/product/product-tag-input-box";
import { cn } from "@/lib/utils";
import { CategoryProps, useCategory } from "@/hooks/use-category";
import { ProductFormProps } from "@/pages/AddProduct";
import * as XLSX from "xlsx";

export const ProductBasicInfoForm = ({
	nextStep,
	productFormData,
	setProductFormData,
	onChange,
	errors,
}: {
	nextStep: () => void;
	productFormData: ProductFormProps;
	setProductFormData: React.Dispatch<SetStateAction<ProductFormProps>>;
	onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	errors: { [key: string]: any };
}) => {
	const [isPopOpen, setIsPopOpen] = useState<boolean>(false);
	const { categories, fetchCategoryById } = useCategory();
	const [category, setCategory] = useState<CategoryProps | null>(null);

	const inputRef = useRef(null);

	const decreaseAttributesItemHandler = (e: any) => {
		if (productFormData.productAttributes.length > 0) {
			const targetedIndex = Number(e.target.dataset.index);
			if (typeof targetedIndex !== "number") return;

			setProductFormData((prevData) => ({
				...prevData,
				productAttributes: productFormData.productAttributes.filter(
					(_attribute, attributeIndex) => attributeIndex !== targetedIndex
				),
			}));
		}
	};
	const increaseAttributesItemHandler = () => {
		setProductFormData({
			...productFormData,
			productAttributes: [
				...productFormData.productAttributes,
				{ property: "", description: "" },
			],
		});
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();

		reader.onload = () => {
			parseExcel(reader.result as ArrayBuffer);
		};

		reader.readAsArrayBuffer(file);
	};

	// Parse Excel File
	const parseExcel = (excelData: ArrayBuffer) => {
		const workbook = XLSX.read(excelData, { type: "array" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

		const data = jsonData.slice(1); // Skip the header row
		const attributes = data.map((row: any) => ({
			property: row[0],
			description: row[1],
		}));

		setProductFormData((prevData) => ({
			...prevData,
			productAttributes: [...prevData.productAttributes, ...attributes],
		}));
	};

	useEffect(() => {
		const fetchCurrentProductCategory = async () => {
			setCategory(await fetchCategoryById(productFormData.categoryId));
		};

		fetchCurrentProductCategory();
	}, [productFormData.categoryId]);

	return (
		<Card className="bg-slate-100/60 backdrop-blur-lg">
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Product Name */}
				<div className="space-y-2 my-4">
					<Label htmlFor="name" className="cursor-pointer">
						Product Name
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="name"
						name="name"
						value={productFormData.name}
						onChange={onChange}
						error={errors.name ? true : false}
					/>

					{errors.name && (
						<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
					)}
				</div>

				{/* Product Slug */}
				<div className="space-y-2 my-4">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Label htmlFor="slug" className="cursor-pointer">
									Product Slug
								</Label>
							</TooltipTrigger>
							<TooltipContent>
								<p className="line-clamp-1 truncate">
									The product slug is auto-generated and is used in the product
									URL.
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<Input id="slug" readOnly value={productFormData.slug} />
				</div>

				<div className="space-y-2 my-4">
					{/* Product Tags */}
					<div className="w-full">
						<ProductTag
							productFormData={productFormData}
							setProductFormData={setProductFormData}
						/>
					</div>
				</div>

				{/* Product Description */}
				<div className="space-y-2 my-4">
					<Label htmlFor="description" className="cursor-pointer">
						Product Description
						<span className="text-skyblue"> *</span>
					</Label>
					<Textarea
						id="description"
						name="description"
						value={productFormData.description}
						onChange={onChange}
						rows={8}
						error={errors.description ? true : false}
					/>

					{errors.description && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.description}
						</p>
					)}
				</div>

				{/* Product Category */}
				<div className="space-y-2 my-4">
					<Popover open={isPopOpen} onOpenChange={setIsPopOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={isPopOpen}
								className="w-[500px] font-normal justify-between"
							>
								{category ? category.name : "Select a Product Category"}
								<ChevronsUpDown className="opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[500px] p-0">
							<Command>
								<CommandInput
									placeholder="Search category..."
									className="h-9"
								/>
								<CommandList>
									<CommandEmpty>No Category found.</CommandEmpty>
									<CommandGroup>
										<CommandItem
											value={"Uncategorized"}
											onSelect={() => {
												setProductFormData({
													...productFormData,
													categoryId: 0,
												});

												setIsPopOpen(false);
											}}
										>
											Uncategorized
											<Check
												className={cn(
													"ml-auto",
													productFormData.categoryId === 0
														? "opacity-100"
														: "opacity-0"
												)}
											/>
										</CommandItem>
										{categories.map((category) => (
											<CommandItem
												key={category.categoryId}
												value={category.name}
												onSelect={() => {
													setProductFormData({
														...productFormData,
														categoryId: Number(category.categoryId),
													});

													setIsPopOpen(false);
												}}
											>
												{category.name}
												<Check
													className={cn(
														"ml-auto",
														productFormData.categoryId === category.categoryId
															? "opacity-100"
															: "opacity-0"
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Product Attributes */}
				<div className="w-full space-y-2 my-4 flex items-baseline gap-2">
					<Label htmlFor="product-attributes" className="cursor-pointer">
						Add Product Attributes
					</Label>
					<div className="flex-1">
						<Dialog>
							<DialogTrigger>
								<Button variant="outline">
									Add <CirclePlus size={15} />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
								<DialogHeader>
									<DialogTitle>Add New Product Attribute</DialogTitle>
									<DialogDescription>
										<p className="text-xs">
											Manage your product attributes effortlessly in this table.
											Each attribute features a title with its associated
											properties and descriptions, helping you define detailed
											product specifications.
										</p>
									</DialogDescription>
								</DialogHeader>

								{/* Individual Attribute Item */}
								{productFormData.productAttributes.map((attribute, index) => {
									return (
										<div
											key={index}
											className="w-full flex items-start justify-center flex-col gap-2"
										>
											<div className="w-full flex items-center justify-between gap-2">
												<h5 className="text-base font-semibold">
													Item #{index + 1}
												</h5>

												<div
													className="flex items-center justify-center bg-rose-500/10 text-rose-500 p-2 rounded-sm cursor-pointer transition-all duration-300 hover:bg-rose-500/20 *:pointer-events-none"
													onClick={decreaseAttributesItemHandler}
													data-index={index}
												>
													<Minus
														onClick={decreaseAttributesItemHandler}
														size={15}
													/>
												</div>
											</div>

											<div className="w-full flex items-start justify-center flex-col gap-4">
												<div className="w-full space-y-1">
													<Label htmlFor={`attribute-property-${index}`}>
														Property
														<span className="text-skyblue"> *</span>
													</Label>
													<Input
														id={`attribute-property-${index}`}
														name={`attribute-property-${index}`}
														value={attribute.property}
														onChange={onChange}
													/>
												</div>

												<div className="w-full space-y-1">
													<Label htmlFor={`attribute-description-${index}`}>
														Description
														<span className="text-skyblue"> *</span>
													</Label>
													<Textarea
														id={`attribute-description-${index}`}
														name={`attribute-description-${index}`}
														rows={5}
														value={attribute.description}
														onChange={onChange}
													/>
												</div>
											</div>
										</div>
									);
								})}

								{/* Add new attribute button */}
								<div
									className="w-full my-2 flex items-center justify-center border-2rem border-dashed rounded-lg p-3 gap-2 cursor-pointer text-xs font-medium *:pointer-events-none"
									onClick={increaseAttributesItemHandler}
								>
									<Plus size={15} />
									<p>Add Values</p>
								</div>

								<DialogFooter>
									<div className="">
										<Button
											variant="secondary"
											onClick={() => (inputRef.current as any)?.click()}
										>
											Import from Excel
										</Button>

										<input
											ref={inputRef}
											className="hidden"
											id="product-attribute-import"
											type="file"
											accept=".csv, .xlsx"
											onChange={handleFileUpload}
										/>
									</div>
									<DialogClose asChild>
										<Button>Save</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* product attribute table demonstration */}
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
			</CardContent>
			<CardFooter>
				<Button onClick={nextStep}>
					Next Step <ArrowRight size={15} />
				</Button>
			</CardFooter>
		</Card>
	);
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Pen,
	Plus,
	Search,
	Trash,
	MoreHorizontal,
	Check,
	ChevronsUpDown,
	Eye,
	Package2,
	Tag,
	Calendar,
	Package,
	Info,
	FileSpreadsheet,
	FileText,
	Ruler,
	Boxes,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableCaption,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Tabs as TabsShadcn,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay, Tabs } from "@mantine/core";
import Header from "@/components/header";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { createExcelSheet, cn, createCSV } from "@/lib/utils";
import routes from "@/routes";
import { ProductProps, useProduct } from "@/hooks/use-product";
import { useCategory } from "@/hooks/use-category";
import { currencyCode } from "@/config";
import ProductPlaceholderImg from "@/assets/images/product-placeholder.jpg";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";
import { useAuth } from "@/hooks/use-auth";
import { productService } from "@/api";

const Product = () => {
	const { products, setSearchTerm, setLimit, error } = useProduct();
	const [searchInput, setSearchInput] = useState<string>("");
	const { toast } = useToast();

	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, []);

	const { categories } = useCategory();
	const [sortedProducts, setSortedProducts] =
		useState<ProductProps[]>(products);
	const [sortedBy, setSortedBy] = useState<
		"default" | "name" | "lowtohigh" | "hightolow" | "recent" | "oldest"
	>("default");
	const [filteredBy, setFilteredBy] = useState<"all" | "active" | "inactive">(
		"all"
	);

	const [popOpen, setPopOpen] = useState<boolean>(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

	useEffect(() => {
		let filteredProducts = products.filter((product) => {
			if (filteredBy === "all") return product;
			if (filteredBy === "active") return product.isActive;
			return !product.isActive;
		});

		if (selectedCategoryId) {
			filteredProducts = filteredProducts.filter(
				(product) => product.categoryId === selectedCategoryId
			);
		}

		// Sort products based on `sortedBy` criteria
		const sorted = [...filteredProducts];
		if (sortedBy === "lowtohigh") {
			sorted.sort((a, b) => a.basePrice - b.basePrice);
		} else if (sortedBy === "hightolow") {
			sorted.sort((a, b) => b.basePrice - a.basePrice);
		} else if (sortedBy === "recent") {
			sorted.sort(
				(a, b) =>
					(new Date(b.createdAt) as any) - (new Date(a.createdAt) as any)
			);
		} else if (sortedBy === "oldest") {
			sorted.sort(
				(a, b) =>
					(new Date(a.createdAt) as any) - (new Date(b.createdAt) as any)
			);
		} else if (sortedBy === "name") {
			sorted.sort((a, b) => a.name.localeCompare(b.name));
		} else {
			sorted.sort((a, b) => a.productId - b.productId); // Default sorting by ID
		}

		// Update the state with the final sorted and filtered products
		setSortedProducts(sorted);
	}, [sortedBy, filteredBy, selectedCategoryId, products]);

	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = sortedProducts.map((product) => ({
			ID: product.productId,
			Name: product.name,
			Description: product.description,
			SKU: product.sku,
			"Base Price": product.basePrice,
			"Minimum Order Quantity (piece)": `${product.minOrderQuantity}`,
			"Discount Start": product.discountStart || "N/A",
			"Discount End": product.discountEnd || "N/A",
			"Discount Percentage": product.discountPercentage
				? `${product.discountPercentage}%`
				: "N/A",
			"Pricing Type": product.pricingType,
			Category:
				categories.filter(
					(category) => category.categoryId === product.categoryId
				)[0]?.name || "Uncategorized",
			Status: product.isActive ? "Active" : "Inactive",
			"Date Added": new Date(product.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "products");
		} else if (format === "csv") {
			createCSV(worksheetData, "products");
		}
	};

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchInput]);

	return (
		<section className="w-full py-5 px-1 space-y-4 overflow-x-scroll ">
			{/* Header */}
			<Header
				title="Products"
				description="All products of your store in one place!"
			>
				<div className="truncate flex items-start space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by product name`}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Link to={routes.product.add.path}>
					<Button>
						<Plus size={15} />
						Add Product
					</Button>
				</Link>
			</Header>

			{/* filter options */}
			{products.length > 0 && (
				<div className="w-full flex items-center justify-between  gap-4">
					<div className="flex items-center justify-between gap-3">
						<Button variant="success" onClick={() => handleExport("excel")}>
							<FileSpreadsheet size={15} />
							Export Excel
						</Button>
						<Button variant="secondary" onClick={() => handleExport("csv")}>
							<FileText size={15} />
							Export CSV
						</Button>
						{/* <Button variant="destructive">
							<Trash size={15} />
							Delete Selected
						</Button> */}
					</div>

					<div className="flex items-center justify-between gap-3">
						<Popover open={popOpen} onOpenChange={setPopOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									className="w-[250px] font-normal justify-between"
								>
									{selectedCategoryId
										? categories.find(
												(category) => category.categoryId === selectedCategoryId
										  )?.name
										: "Filter by Category"}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[250px] p-0">
								<Command>
									<CommandInput
										placeholder="Search category..."
										className="h-9"
									/>
									<CommandList>
										<CommandEmpty>No Category found.</CommandEmpty>
										<CommandGroup>
											<CommandItem
												key={"all"}
												value={"All"}
												onSelect={() => {
													setSelectedCategoryId(0);
													setPopOpen(false);
												}}
											>
												All
												<Check
													className={cn(
														"ml-auto",
														selectedCategoryId === 0
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
														setSelectedCategoryId(category.categoryId);

														setPopOpen(false);
													}}
												>
													{category.name}
													<Check
														className={cn(
															"ml-auto",
															selectedCategoryId === category.categoryId
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

						<Select onValueChange={(e) => setSortedBy(e as any)}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="default">Default</SelectItem>
									<SelectItem value="name">Name</SelectItem>
									<SelectItem value="lowtohigh">Price (low to high)</SelectItem>
									<SelectItem value="hightolow">Price (high to low)</SelectItem>
									<SelectItem value="recent">Recently Added</SelectItem>
									<SelectItem value="oldest">Old Items</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select onValueChange={(e) => setLimit(Number(e) as number)}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Show items" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="90">90</SelectItem>
									<SelectItem value="120">120</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{/* product tabs */}
			{products.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="active">Active</Tabs.Tab>
							<Tabs.Tab value="inactive">Inactive</Tabs.Tab>
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable products={sortedProducts} />
						</Tabs.Panel>

						{/* active tab */}
						<Tabs.Panel value="active">
							<RenderTable products={sortedProducts} />
						</Tabs.Panel>

						{/* inactive tab */}
						<Tabs.Panel value="inactive">
							<RenderTable products={sortedProducts} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No product found</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({ products }: { products: ProductProps[] }) => {
	const { toast } = useToast();
	const { loading, totalPages, page, setPage, setLoading, fetchProduct } =
		useProduct();
	const { authToken, logout, user } = useAuth();
	const { fetchCategoryById } = useCategory();

	const [productCategories, setProductCategories] = useState<
		Map<number, string>
	>(new Map());

	useEffect(() => {
		const fetchCategoriesForProducts = async () => {
			const newCategories = new Map(productCategories);

			await Promise.all(
				products.map(async (product) => {
					if (product.categoryId && !newCategories.has(product.categoryId)) {
						const category = await fetchCategoryById(product.categoryId);
						if (category) newCategories.set(product.categoryId, category.name);
					}
				})
			);

			setProductCategories(newCategories);
		};

		fetchCategoriesForProducts();
	}, [products]);

	const [viewSheetOpenId, setViewSheetOpenId] = useState<number | null>(null);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	const setProductStatus = async (e: any, setStatus: "active" | "inactive") => {
		try {
			e.preventDefault();
			setLoading(true);
			const productId = e.target.dataset.productid;

			if (!authToken) return logout();

			if (setStatus === "active") {
				await productService.activeProduct(authToken, productId);
			} else if (setStatus === "inactive") {
				await productService.inactiveProduct(authToken, productId);
			}

			await fetchProduct();
			return;
		} catch (err: any) {
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full border border-neutral-200 rounded-lg">
			<Table className="border-collapse px-0 w-full">
				<TableCaption className="py-4 border border-t border-neutral-200">
					Showing {products.length} entries from {}
					<div className="w-full text-black">
						{totalPages > 1 && (
							<AppPagination
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						)}
					</div>
				</TableCaption>
				<TableHeader>
					<TableRow className="bg-slate-100 hover:bg-slate-100">
						<TableHead className="pl-5">
							<Checkbox />
						</TableHead>
						<TableHead>Image</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>SKU</TableHead>
						<TableHead>Base Price ({currencyCode})</TableHead>
						<TableHead>Min Order Quantity (piece)</TableHead>
						<TableHead>Pricing Type</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Date Added</TableHead>
						<TableHead className="w-max pr-5">Actions</TableHead>
					</TableRow>
				</TableHeader>
				{loading ? (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
						/>
					</>
				) : (
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.productId}>
								<TableCell className="pl-5">
									<Checkbox />
								</TableCell>
								<TableCell>
									<div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-sm">
										<img
											src={product.images[0]?.imageUrl || ProductPlaceholderImg}
											alt={product.name}
											className="w-full h-full object-cover object-center rounded-md"
										/>
									</div>
								</TableCell>
								<TableCell>{product.name}</TableCell>
								<TableCell>
									<Badge size="sm">{product.sku}</Badge>
								</TableCell>
								<TableCell>
									{product.basePrice.toLocaleString()} {currencyCode}
								</TableCell>
								<TableCell>{product.minOrderQuantity} (piece)</TableCell>
								<TableCell>{product.pricingType}</TableCell>
								<TableCell>
									{product.categoryId
										? productCategories.get(product.categoryId) || "Loading..."
										: "Uncategorized"}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="w-max">
												<span className="sr-only">{product.isActive}</span>

												<Badge
													size="sm"
													variant={product.isActive ? "success" : "destructive"}
												>
													{product.isActive ? "active" : "inactive"}
												</Badge>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Status</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuGroup>
												<DropdownMenuCheckboxItem
													{...{
														"data-productid": product.productId,
													}}
													className="text-green-500"
													checked={product.isActive}
													onClick={(e) => setProductStatus(e, "active")}
												>
													Active
												</DropdownMenuCheckboxItem>
												<DropdownMenuCheckboxItem
													{...{
														"data-productid": product.productId,
													}}
													className="text-rose-500"
													checked={!product.isActive}
													onClick={(e) => setProductStatus(e, "inactive")}
												>
													Inactive
												</DropdownMenuCheckboxItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
								<TableCell>
									{new Date(product.createdAt).toDateString()}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost">
												<MoreHorizontal />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuGroup>
												<DropdownMenuItem
													onClick={() => setViewSheetOpenId(product.productId)}
												>
													<Eye />
													View
												</DropdownMenuItem>

												{user?.role === "admin" && (
													<>
														<Link
															to={`${routes.product.add.path}/?productId=${product.productId}`}
														>
															<DropdownMenuItem>
																<Pen />
																Edit
															</DropdownMenuItem>
														</Link>

														<DropdownMenuItem
															className="text-rose-500"
															onClick={() =>
																setDeleteDialogOpenId(product.productId)
															}
														>
															<Trash />
															Delete
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>

									<ProductDetailSheet
										product={product}
										viewSheetOpenId={viewSheetOpenId}
										setViewSheetOpenId={setViewSheetOpenId}
									/>

									{/* product item delete dialog */}
									<ProductDeleteDialog
										productId={product.productId}
										deleteDialogOpenId={deleteDialogOpenId}
										setDeleteDialogOpenId={setDeleteDialogOpenId}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				)}
			</Table>
		</div>
	);
};

interface ProductDetailSheetProps {
	product: ProductProps;
	viewSheetOpenId: number | null;
	setViewSheetOpenId: React.Dispatch<React.SetStateAction<number | null>>;
}

const ProductDetailSheet = ({
	product,
	viewSheetOpenId,
	setViewSheetOpenId,
}: ProductDetailSheetProps) => {
	const { categories } = useCategory();

	return (
		<Sheet
			open={viewSheetOpenId === product.productId}
			onOpenChange={(open) => {
				setViewSheetOpenId(open ? product.productId : null);
			}}
		>
			<SheetContent className="w-full sm:max-w-3xl overflow-y-auto py-5 px-0">
				<ScrollArea className="h-full">
					<div className="p-6">
						<SheetHeader className="text-left mb-6">
							<div className="flex justify-between items-start">
								<div>
									<SheetTitle className="text-2xl font-bold">
										{product.name}
									</SheetTitle>
									<SheetDescription className="text-sm mt-1">
										{product.description}
									</SheetDescription>
								</div>

								<Badge
									variant={product.isActive ? "success" : "destructive"}
									className="ml-2"
								>
									{product.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
							{product?.tags && (
								<div className="w-full flex gap-2 my-2">
									{product?.tags.map((tag) => (
										<span className="text-sm font-poppins font-medium underline">
											#{tag.tag}
										</span>
									))}
								</div>
							)}
						</SheetHeader>

						<Separator className="my-2 bg-slate-950/10" />

						{/* Product images carousel */}
						<Carousel className="w-full">
							<CarouselContent>
								{product.images.map((image, index) => (
									<CarouselItem key={index} className="basis-1/3">
										<div className="w-full h-full flex items-center justify-center">
											<img
												src={image.imageUrl}
												alt={`${product.name} - Image ${index + 1}`}
												className="max-w-full h-full rounded-md border-2rem border-skyblue shadow-lg"
											/>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
						</Carousel>

						<Separator className="my-4 bg-slate-950/10" />

						<TabsShadcn defaultValue="details" className="mb-8">
							<TabsList className="grid grid-cols-3 mb-4 w-full">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="pricing">Pricing</TabsTrigger>
								<TabsTrigger value="attributes">Attributes</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<Card className="bg-slate-100/60 backdrop-blur-lg">
										<CardContent className="p-4 flex items-center space-x-3">
											<Package2 className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">SKU</p>
												<p className="text-sm text-muted-foreground">
													{product.sku}
												</p>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-slate-100/60 backdrop-blur-lg">
										<CardContent className="p-4 flex items-center space-x-3">
											<Tag className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">Category</p>
												<p className="text-sm text-muted-foreground">
													{product.categoryId
														? `Category -${
																categories.filter(
																	(category) =>
																		category.categoryId === product.categoryId
																)[0]?.name || "Uncategorized"
														  }`
														: "Uncategorized"}
												</p>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-slate-100/60 backdrop-blur-lg">
										<CardContent className="p-4 flex items-center space-x-3">
											<Calendar className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">Created</p>
												<p className="text-sm text-muted-foreground">
													{new Date(product.createdAt).toDateString()}
												</p>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-slate-100/60 backdrop-blur-lg">
										<CardContent className="p-4 flex items-center space-x-3">
											<Calendar className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">Updated</p>
												<p className="text-sm text-muted-foreground">
													{new Date(product.updatedAt).toDateString()}
												</p>
											</div>
										</CardContent>
									</Card>
								</div>

								<Separator className="my-2 bg-slate-950/10" />

								{product.variations.length > 0 && (
									<div className="mt-4">
										<h3 className="text-base font-semibold mb-2">Variations</h3>
										<div className="flex flex-col gap-2">
											{product.variations.map((variation) => (
												<div
													key={variation.variationId}
													className="flex flex-wrap items-center gap-2"
												>
													<h5 className="text-sm font-poppins font-semibold">
														{variation.name}:
													</h5>

													<div className="space-x-2">
														{variation.variationItems.map(
															(productVariationItem, itemIndex) => (
																<Button
																	key={itemIndex}
																	variant="outline"
																	size="sm"
																>
																	{productVariationItem.value} {variation.unit}
																</Button>
															)
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								<Separator className="my-2 bg-slate-950/10" />

								{product.variants.length > 0 && (
									<div className="mt-4">
										<h3 className="text-base font-semibold mb-2">
											Product Variants
										</h3>
										<div className="flex flex-col gap-2">
											<h5 className="text-sm font-poppins">
												Total {product.variants.length} variants
											</h5>
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="pricing">
								<Card className="bg-slate-100/60 backdrop-blur-lg">
									<CardContent className="p-4 space-y-4">
										<div className="flex justify-between items-start">
											<div className="flex flex-col gap-2">
												<p className="text-sm font-medium">
													Base Price ({currencyCode})
												</p>
												<p className="text-2xl font-bold">
													{product.basePrice.toLocaleString()} {currencyCode}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Badge
													variant="default"
													className="capitalize flex gap-2"
												>
													<Tag size={14} />
													{product.pricingType} pricing
												</Badge>
											</div>
										</div>

										<div className="flex gap-2 w-full justify-between items-center">
											<h5 className="text-sm font-semibold mb-2">
												Minimum Order Quantity
											</h5>
											<Badge variant="secondary" className="flex gap-2">
												<Package size={14} />
												{product.minOrderQuantity} units
											</Badge>
										</div>

										<div className="flex gap-2 w-full justify-between items-center">
											<h5 className="text-sm font-semibold mb-2">
												Maximum Discount Percentage
											</h5>
											<Badge
												variant={
													product.discountPercentage ? "success" : "default"
												}
												className="flex gap-2"
											>
												<Tag size={14} />
												{product.discountPercentage
													? `${product.discountPercentage}%`
													: "No discount"}
											</Badge>
										</div>

										{/* discount start and end quantity or sqfeet basis based on pricing type ("flat" | "sqfeet") */}
										{product.discountStart && product.discountEnd && (
											<div className="flex gap-2 w-full justify-between items-center">
												<h5 className="text-sm font-semibold mb-2">
													Discount Range
												</h5>

												<Badge
													variant="order-request-received"
													className="flex gap-2"
												>
													{product.pricingType === "flat" ? (
														<Boxes size={14} />
													) : (
														<Ruler size={14} />
													)}
													{product.discountStart} - {product.discountEnd}{" "}
													{product.pricingType === "flat"
														? "(piece)"
														: "sq.feet"}
												</Badge>
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="attributes">
								{product.attributes.length > 0 ? (
									<Card className="bg-slate-100/60 backdrop-blur-lg">
										<CardContent className="p-4">
											<Accordion type="single" collapsible className="w-full">
												{product.attributes.map((attribute, index) => (
													<div key={index}>
														<AccordionItem
															key={attribute.attributeId}
															value={`attr-${attribute.attributeId}`}
															className="py-0 my-0"
														>
															<AccordionTrigger className="text-sm font-medium">
																{attribute.property}
															</AccordionTrigger>
															<AccordionContent className="text-sm">
																{attribute.description}
															</AccordionContent>
														</AccordionItem>
														{index < product.attributes.length - 1 && (
															<Separator className="my-2 bg-slate-950/10" />
														)}
													</div>
												))}
											</Accordion>
										</CardContent>
									</Card>
								) : (
									<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
										<Info className="h-12 w-12 mb-2" />
										<p>No attributes available for this product</p>
									</div>
								)}
							</TabsContent>
						</TabsShadcn>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
};

interface ProductDeleteDialogProps {
	productId: number;
	deleteDialogOpenId: number | null;
	setDeleteDialogOpenId: React.Dispatch<React.SetStateAction<number | null>>;
}

const ProductDeleteDialog = ({
	productId,
	deleteDialogOpenId,
	setDeleteDialogOpenId,
}: ProductDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchProduct } = useProduct();

	const deleteProduct = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await productService.deleteProduct(authToken, productId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchProduct();
			return;
		} catch (err: any) {
			setLoading(false);
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		}
	};

	return (
		<AlertDialog
			open={deleteDialogOpenId === productId}
			onOpenChange={(open) => setDeleteDialogOpenId(open ? productId : null)}
		>
			{loading && (
				<>
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				</>
			)}

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This product will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteProduct}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Product;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash, CirclePlus, MoreHorizontal, Pen } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import React, { ChangeEvent, useEffect, useState } from "react";
import { createSlug } from "@/lib/utils";
import { useCategory } from "@/hooks/use-category";
import { LoadingOverlay } from "@mantine/core";
import { categoryService } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";

interface CategoryCreationFormProps {
	name: string;
	parentCategoryId: number;
}

const Category = () => {
	const {
		categories,
		setSearchTerm,
		totalPages,
		page,
		setPage,
		loading,
		error,
	} = useCategory();
	const [searchInput, setSearchInput] = useState<string>("");
	const { toast } = useToast();

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchInput]);

	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, []);

	const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] =
		useState<boolean>(false);
	const [openDeleteCategoryDialogId, setOpenDeleteCategoryDialogId] = useState<
		number | null
	>(null);
	const [openEditCategoryDialogId, setOpenEditCategoryDialogId] = useState<
		number | null
	>(null);

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Category"
				description="All Category of your store in one place!"
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search by category name"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				{/* Add category dialog */}
				<Button onClick={() => setIsAddCategoryDialogOpen(true)}>
					Add Category <CirclePlus size={15} />
				</Button>

				{/* Add Category Dialog */}
				<CategoryAddDialog
					isOpen={isAddCategoryDialogOpen}
					setIsOpen={setIsAddCategoryDialogOpen}
				/>
			</Header>

			{/* category table */}
			{categories.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Table className="border-collapse px-0 w-full">
						<TableCaption className="py-4 border border-t border-neutral-200">
							Showing {categories.length} entries
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
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Parent Category</TableHead>
								<TableHead>Number of Products</TableHead>
								<TableHead>Date Added</TableHead>
								<TableHead className="w-[60px] pr-5">Actions</TableHead>
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
								{categories.map((category) => (
									<TableRow key={category.categoryId}>
										<TableCell className="pl-5">
											<Checkbox />
										</TableCell>
										<TableCell>{category.name}</TableCell>
										<TableCell>{category.slug}</TableCell>
										<TableCell>
											{category.parentCategoryId && category.parentCategory
												? category.parentCategory.name
												: "N/A"}
										</TableCell>
										<TableCell>{category.products.length}</TableCell>
										<TableCell>
											{new Date(category.createdAt).toDateString()}
										</TableCell>
										<TableCell className="space-x-2">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost">
														<MoreHorizontal />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className="w-56"
													side="bottom"
													align="end"
												>
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuItem
															onClick={() =>
																setOpenEditCategoryDialogId(category.categoryId)
															}
														>
															<Pen />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-rose-500"
															onClick={() =>
																setOpenDeleteCategoryDialogId(
																	category.categoryId
																)
															}
														>
															<Trash />
															Delete
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
											{/* Edit Category Dialog */}
											<CategoryEditDialog
												categoryId={category.categoryId}
												isOpen={
													openEditCategoryDialogId === category.categoryId
												}
												setIsOpen={(isOpen) =>
													setOpenEditCategoryDialogId(
														isOpen ? category.categoryId : null
													)
												}
											/>

											{/* Delete Category Dialog */}
											<CategoryDeleteDialog
												categoryId={category.categoryId}
												isOpen={
													openDeleteCategoryDialogId === category.categoryId
												}
												setIsOpen={(isOpen) =>
													setOpenDeleteCategoryDialogId(
														isOpen ? category.categoryId : null
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						)}
					</Table>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No category found</p>
				</div>
			)}
		</section>
	);
};

interface CategoryAddDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategoryAddDialog = ({ isOpen, setIsOpen }: CategoryAddDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { categories, loading, setLoading, fetchCategory } = useCategory();

	const [categoryCreationFormData, setCategoryCreationFormData] =
		useState<CategoryCreationFormProps>({
			name: "",
			parentCategoryId: 0,
		});
	const [slug, setSlug] = useState<string>(
		createSlug(categoryCreationFormData.name)
	);

	const { errors, validateField, validateForm } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		validateField(name, value, categoryService.categoryCreationSchema);

		setCategoryCreationFormData({
			...categoryCreationFormData,
			[name]: value,
		});
	};

	useEffect(() => {
		setSlug(createSlug(categoryCreationFormData.name));
	}, [categoryCreationFormData.name]);

	const addCategory = async () => {
		try {
			if (
				validateForm(
					categoryCreationFormData,
					categoryService.categoryCreationSchema
				)
			) {
				setLoading(true);

				if (!authToken) {
					return logout();
				}

				const response = await categoryService.createCategory(
					authToken,
					categoryCreationFormData.name,
					categoryCreationFormData.parentCategoryId
				);

				toast({
					description: response.message,
					variant: response.status === 201 ? "success" : "default",
					duration: 10000,
				});

				setCategoryCreationFormData({
					name: "",
					parentCategoryId: 0,
				});

				setIsOpen(false);
				await fetchCategory();
				return;
			}
		} catch (err: any) {
			setLoading(false);
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
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle>Add New Category</DialogTitle>
				</DialogHeader>

				{loading && (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
						/>
					</>
				)}

				<div className="space-y-2">
					<Label htmlFor="name" className="cursor-pointer">
						Name
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="name"
						name="name"
						value={categoryCreationFormData.name}
						onChange={handleChange}
						error={errors.name ? true : false}
					/>

					{errors.name && (
						<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug" className="cursor-pointer">
						Slug
						<span className="text-skyblue"> *</span>
					</Label>
					<Input id="slug" readOnly value={slug} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="parentCategoryId">Parent Category</Label>
					<Select
						onValueChange={(value) => {
							validateField(
								"parentCategoryId",
								Number(value),
								categoryService.categoryCreationSchema
							);

							setCategoryCreationFormData({
								...categoryCreationFormData,
								parentCategoryId: Number(value),
							});
						}}
						name="parentCategoryId"
					>
						<SelectTrigger
							error={errors.parentCategoryId ? true : false}
							className="w-full"
							id="parentCategoryId"
						>
							<SelectValue placeholder="Select parent category" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="0" className="opacity-70">
									Uncategorized
								</SelectItem>
								{categories.map((category) => (
									<SelectItem
										key={category.categoryId.toString()}
										value={category.categoryId.toString()}
									>
										{category.name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					{errors.parentCategoryId && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.parentCategoryId}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button onClick={addCategory}>Add</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface CategoryEditDialogProps {
	categoryId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategoryEditDialog = ({
	categoryId,
	isOpen,
	setIsOpen,
}: CategoryEditDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { categories, loading, setLoading, fetchCategory } = useCategory();
	const category = categories.find(
		(category) => category.categoryId === categoryId
	);

	if (!category) return;

	const [categoryEditFormData, setCategoryEditFormData] =
		useState<CategoryCreationFormProps>({
			name: category.name || "",
			parentCategoryId: category.parentCategoryId || 0,
		});
	const [slug, setSlug] = useState<string>(
		createSlug(categoryEditFormData.name)
	);

	const { errors, validateField, validateForm } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		validateField(name, value, categoryService.categoryEditSchema);

		setCategoryEditFormData({
			...categoryEditFormData,
			[name]: value,
		});
	};

	useEffect(() => {
		setSlug(createSlug(categoryEditFormData.name));
	}, [categoryEditFormData.name]);

	const updateCategory = async () => {
		try {
			if (
				validateForm(categoryEditFormData, categoryService.categoryEditSchema)
			) {
				setLoading(true);

				if (!authToken) {
					return logout();
				}

				const response = await categoryService.editCategory(
					authToken,
					categoryId,
					categoryEditFormData.name,
					categoryEditFormData.parentCategoryId
				);

				toast({
					description: response.message,
					variant: response.status === 200 ? "success" : "default",
					duration: 10000,
				});

				setCategoryEditFormData({
					name: "",
					parentCategoryId: 0,
				});

				setIsOpen(false);
				await fetchCategory();
				return;
			}
		} catch (err: any) {
			setLoading(false);
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
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle>Edit Category</DialogTitle>
				</DialogHeader>

				{loading && (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
						/>
					</>
				)}

				<div className="space-y-2">
					<Label htmlFor="name" className="cursor-pointer">
						Name
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="name"
						name="name"
						value={categoryEditFormData.name}
						onChange={handleChange}
						error={errors.name ? true : false}
					/>

					{errors.name && (
						<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug" className="cursor-pointer">
						Slug
						<span className="text-skyblue"> *</span>
					</Label>
					<Input id="slug" readOnly value={slug} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="parentCategoryId">Parent Category</Label>
					<Select
						value={categoryEditFormData.parentCategoryId?.toString() || "0"}
						onValueChange={(value) => {
							validateField(
								"parentCategoryId",
								Number(value),
								categoryService.categoryCreationSchema
							);

							setCategoryEditFormData({
								...categoryEditFormData,
								parentCategoryId: Number(value),
							});
						}}
						name="parentCategoryId"
					>
						<SelectTrigger
							error={errors.parentCategoryId ? true : false}
							className="w-full"
							id="parentCategoryId"
						>
							<SelectValue placeholder="Select parent category" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="0" className="opacity-70">
									Uncategorized
								</SelectItem>
								{categories.map((category) => (
									<SelectItem
										key={category.categoryId.toString()}
										value={category.categoryId.toString()}
									>
										{category.name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					{errors.parentCategoryId && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.parentCategoryId}
						</p>
					)}
				</div>
				<DialogFooter>
					<Button onClick={updateCategory}>Update</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface CategoryDeleteDialogProps {
	categoryId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategoryDeleteDialog = ({
	categoryId,
	isOpen,
	setIsOpen,
}: CategoryDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchCategory } = useCategory();

	const deleteCategory = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await categoryService.deleteCategory(
				authToken,
				categoryId
			);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchCategory();
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
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
						This action cannot be undone. This category will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteCategory}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Category;

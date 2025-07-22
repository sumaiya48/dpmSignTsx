import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/ui/app-pagination";
import {
	MoreHorizontal,
	PlusCircle,
	Search,
	ImageIcon,
	Upload,
	Pen,
	Trash,
	CirclePlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/header";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBlog } from "@/hooks/use-blog";
import { useAuth } from "@/hooks/use-auth";
import { blogService } from "@/api";
import { LoadingOverlay } from "@mantine/core";
import { Badge } from "@/components/ui/badge";

const mdParser = new MarkdownIt();

const Blog = () => {
	const { blogs, loading, setSearchTerm, page, setPage, totalPages, error } =
		useBlog();
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

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchInput]);

	const [openEditBlogDialogId, setOpenEditBlogDialogId] = useState<
		number | null
	>(null);
	const [isAddBlogDialogOpen, setIsAddBlogDialogOpen] =
		useState<boolean>(false);

	const [openDeleteBlogDialogId, setOpenDeleteBlogDialogId] = useState<
		number | null
	>(null);

	return (
		<section className="w-full py-5 px-2 space-y-4 overflow-x-scroll ">
			{/* Heading */}
			<Header
				title="Blogs"
				description="All the blogs of Dhaka Plastic & Metal is here."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Button onClick={() => setIsAddBlogDialogOpen(true)}>
					Create Blog <CirclePlus size={15} />
				</Button>

				<BlogCreateDialog
					isOpen={isAddBlogDialogOpen}
					setIsOpen={(isOpen) => setIsAddBlogDialogOpen(isOpen)}
				/>
			</Header>

			<div className="w-full border border-neutral-200 rounded-lg py-10">
				<div className="w-full flex items-center">
					{blogs.length === 0 ? (
						<div className="w-full text-center py-20">
							<p className="text-neutral-600 mb-6">No blog posts found</p>
							<Button
								onClick={() => setIsAddBlogDialogOpen(true)}
								className="group"
							>
								<PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
								Create your first blog post
							</Button>
						</div>
					) : (
						<div className="w-full grid grid-cols-3 gap-2 px-6">
							{loading ? (
								<>
									<LoadingOverlay
										visible={loading}
										zIndex={10}
										overlayProps={{ radius: "xs", blur: 1 }}
									/>
								</>
							) : (
								<>
									{blogs.map((blog, index) => (
										<div key={index} className="h-full">
											<Card
												className={cn(
													"max-w-72 overflow-hidden h-full transition-all duration-300 bg-white border-border"
												)}
											>
												<div className="relative overflow-hidden">
													<div className={cn("absolute inset-0 bg-gray-100")} />
													<img
														src={blog.bannerImgUrl}
														alt={blog.title}
														className={cn(
															"object-cover w-72 h-72 transition-opacity duration-500"
														)}
													/>

													<div
														className={cn(
															"absolute top-2 right-2 transition-opacity duration-200"
														)}
													>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<button className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
																	<MoreHorizontal size={16} />
																</button>
															</DropdownMenuTrigger>
															<DropdownMenuContent
																align="end"
																className="w-[160px]"
															>
																<DropdownMenuItem
																	onClick={() =>
																		setOpenEditBlogDialogId(blog.blogId)
																	}
																>
																	<Pen />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem
																	className="text-rose-500"
																	onClick={() =>
																		setOpenDeleteBlogDialogId(blog.blogId)
																	}
																>
																	<Trash />
																	Delete
																</DropdownMenuItem>{" "}
															</DropdownMenuContent>
														</DropdownMenu>

														{/* blog edit dialog */}
														<BlogEditDialog
															blogId={blog.blogId}
															isOpen={openEditBlogDialogId === blog.blogId}
															setIsOpen={(isOpen) =>
																setOpenEditBlogDialogId(
																	isOpen ? blog.blogId : null
																)
															}
														/>
														{/* delete dialog */}
														<DeleteBlogDialog
															blogId={blog.blogId}
															isOpen={openDeleteBlogDialogId === blog.blogId}
															setIsOpen={(isOpen) =>
																setOpenDeleteBlogDialogId(
																	isOpen ? blog.blogId : null
																)
															}
														/>
													</div>
												</div>

												<CardContent className="p-4">
													<div className="space-y-4">
														<Badge size="sm" variant="secondary">
															{new Date(blog.createdAt).toDateString()}
														</Badge>
														<h3 className="font-medium text-base line-clamp-1 mb-2 text-skyblue">
															{blog.title}
														</h3>
														<p className="text-neutral-600 text-sm line-clamp-2">
															{blog.content.slice(0, 20)}...
														</p>
													</div>
												</CardContent>
											</Card>
										</div>
									))}
								</>
							)}
						</div>
					)}
				</div>

				{totalPages > 1 && (
					<AppPagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				)}
			</div>
		</section>
	);
};

interface BlogFormProps {
	title: string;
	content: string;
	bannerImg: File | null;
}

interface BlogCreateDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BlogCreateDialog = ({ isOpen, setIsOpen }: BlogCreateDialogProps) => {
	const { toast } = useToast();
	const { loading, setLoading, fetchBlogs } = useBlog();
	const { authToken, logout } = useAuth();

	const [blogCreateFormData, setBlogCreateFormData] = useState<BlogFormProps>({
		title: "",
		content: "",
		bannerImg: null,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setBlogCreateFormData({
			...blogCreateFormData,
			[name]: value,
		});
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setBlogCreateFormData({
			...blogCreateFormData,
			bannerImg: file,
		});
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleSave = async () => {
		try {
			if (
				blogCreateFormData.title.length > 0 &&
				blogCreateFormData.content.length > 0 &&
				blogCreateFormData.bannerImg
			) {
				setLoading(true);

				if (!authToken) return logout();

				const response = await blogService.createBlog(
					authToken,
					blogCreateFormData.title,
					blogCreateFormData.content,
					blogCreateFormData.bannerImg
				);

				console.log(response);

				toast({
					description: response.message,
					variant: response.status === 200 ? "success" : "default",
					duration: 10000,
				});

				setBlogCreateFormData({
					title: "",
					content: "",
					bannerImg: null,
				});
				setIsOpen(false);

				await fetchBlogs();
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
			<DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Blog Post</DialogTitle>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					{loading && (
						<>
							<LoadingOverlay
								visible={loading}
								zIndex={10}
								overlayProps={{ radius: "xs", blur: 1 }}
							/>
						</>
					)}
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							name="title"
							value={blogCreateFormData.title}
							onChange={handleChange}
							placeholder="Enter blog title"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="image">Featured Image</Label>
						<div className="flex flex-col space-y-4">
							<div
								onClick={triggerFileInput}
								className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
							>
								<input
									ref={fileInputRef}
									type="file"
									id="bannerImg"
									name="bannerImg"
									accept="image/*"
									onChange={handleImageChange}
									className="hidden"
								/>
								{!blogCreateFormData.bannerImg ? (
									<div className="flex flex-col items-center text-muted-foreground py-4">
										<Upload className="h-10 w-10 mb-2" />
										<p className="font-medium">Click to upload image</p>
										<p className="text-sm">SVG, PNG, JPG or GIF (max. 20MB)</p>
									</div>
								) : (
									<div className="relative w-full pt-[60%] bg-gray-100 rounded-md overflow-hidden">
										<img
											src={URL.createObjectURL(blogCreateFormData.bannerImg)}
											alt="Preview"
											className="absolute inset-0 w-full h-full object-cover"
										/>
										<div className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded">
											<ImageIcon className="h-4 w-4" />
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="content">Content</Label>
						<div data-color-mode="light" className="w-full">
							<MdEditor
								readOnly={loading}
								value={blogCreateFormData.content}
								style={{ height: "400px" }}
								renderHTML={(text) => mdParser.render(text)}
								onChange={({ text }) => {
									setBlogCreateFormData((prevData) => ({
										...prevData,
										content: text || "",
									}));
								}}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						type="submit"
						onClick={handleSave}
						disabled={
							blogCreateFormData.title.length > 0 &&
							blogCreateFormData.content.length > 0 &&
							blogCreateFormData.bannerImg
								? false
								: true
						}
					>
						Create Blog
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface BlogEditDialogProps {
	blogId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BlogEditDialog = ({ isOpen, setIsOpen, blogId }: BlogEditDialogProps) => {
	const { toast } = useToast();
	const { loading, setLoading, fetchBlogs, blogs } = useBlog();
	const { authToken, logout } = useAuth();
	const blog = blogs.find((blog) => blog.blogId === blogId);

	if (!blog) {
		return;
	}

	const [blogEditFormData, setBlogEditFormData] = useState<BlogFormProps>({
		title: blog.title,
		content: blog.content,
		bannerImg: null,
	});

	useEffect(() => {
		const fetchData = async () => {
			const fetchBannerImageResponse = await fetch(blog.bannerImgUrl);
			const blob = await fetchBannerImageResponse.blob();
			const file = new File([blob], blog.bannerImg, { type: blob.type });
			setBlogEditFormData((prevData) => ({
				...prevData,
				bannerImg: file,
			}));
		};
		fetchData();
	}, [blog.bannerImgUrl]);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setBlogEditFormData({
			...blogEditFormData,
			[name]: value,
		});
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setBlogEditFormData({
			...blogEditFormData,
			bannerImg: file,
		});
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleSave = async () => {
		try {
			if (
				blogEditFormData.title.length > 0 &&
				blogEditFormData.content.length > 0 &&
				blogEditFormData.bannerImg
			) {
				setLoading(true);

				console.log(blogEditFormData);

				if (!authToken) return logout();

				const response = await blogService.editBlog(
					authToken,
					blogId,
					blogEditFormData.title,
					blogEditFormData.content,
					blogEditFormData.bannerImg
				);

				console.log(response);

				toast({
					description: response.message,
					variant: response.status === 200 ? "success" : "default",
					duration: 10000,
				});

				setBlogEditFormData({
					title: "",
					content: "",
					bannerImg: null,
				});
				setIsOpen(false);

				await fetchBlogs();
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
			<DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Blog Post</DialogTitle>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					{loading && (
						<>
							<LoadingOverlay
								visible={loading}
								zIndex={10}
								overlayProps={{ radius: "xs", blur: 1 }}
							/>
						</>
					)}
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							name="title"
							value={blogEditFormData.title}
							onChange={handleChange}
							placeholder="Enter blog title"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="image">Featured Image</Label>
						<div className="flex flex-col space-y-4">
							<div
								onClick={triggerFileInput}
								className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
							>
								<input
									ref={fileInputRef}
									type="file"
									id="bannerImg"
									name="bannerImg"
									accept="image/*"
									onChange={handleImageChange}
									className="hidden"
								/>
								{!blogEditFormData.bannerImg ? (
									<div className="flex flex-col items-center text-muted-foreground py-4">
										<Upload className="h-10 w-10 mb-2" />
										<p className="font-medium">Click to upload image</p>
										<p className="text-sm">SVG, PNG, JPG or GIF (max. 20MB)</p>
									</div>
								) : (
									<div className="relative w-full pt-[60%] bg-gray-100 rounded-md overflow-hidden">
										<img
											src={URL.createObjectURL(blogEditFormData.bannerImg)}
											alt="Preview"
											className="absolute inset-0 w-full h-full object-cover"
										/>
										<div className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded">
											<ImageIcon className="h-4 w-4" />
										</div>
									</div>
								)}
							</div>
							{blogEditFormData.bannerImg && (
								<Button
									variant="outline"
									size="sm"
									onClick={triggerFileInput}
									className="w-full"
								>
									Change Image
								</Button>
							)}
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="content">Content</Label>
						<div data-color-mode="light" className="w-full">
							<MdEditor
								readOnly={loading}
								value={blogEditFormData.content}
								style={{ height: "400px" }}
								renderHTML={(text) => mdParser.render(text)}
								onChange={({ text }) => {
									setBlogEditFormData((prevData) => ({
										...prevData,
										content: text || "",
									}));
								}}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						type="submit"
						onClick={handleSave}
						disabled={
							blogEditFormData.title.length > 0 &&
							blogEditFormData.content.length > 0 &&
							blogEditFormData.bannerImg
								? false
								: true
						}
					>
						Update Blog
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface DeleteBlogDialogProps {
	blogId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteBlogDialog = ({
	blogId,
	isOpen,
	setIsOpen,
}: DeleteBlogDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchBlogs } = useBlog();

	const deleteBlog = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await blogService.deleteBlog(authToken, blogId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchBlogs();
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
					<Button variant="destructive" onClick={deleteBlog}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Blog;

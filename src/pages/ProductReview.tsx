import { Button } from "@/components/ui/button";
import { Trash, Star, Eye, MoreHorizontal } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import {
	ProductReviewProps,
	useProductReview,
} from "@/hooks/use-product-review";
import { useAuth } from "@/hooks/use-auth";
import { productReviewService } from "@/api";
import { useToast } from "@/hooks/use-toast";
import AvatarImg from "@/assets/images/avatar.png";
import { AppPagination } from "@/components/ui/app-pagination";

const ProductReview = () => {
	const { reviews, error } = useProductReview();
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

	const [filteredBy, setFilteredBy] = useState<
		"all" | "published" | "unpublished"
	>("all");

	const filteredReviews = reviews.filter((review) => {
		if (filteredBy === "all") return true;
		return review.status === filteredBy;
	});

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Product Reviews"
				description="See what customers are saying about your products."
			></Header>

			{/* review table */}
			{reviews.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="published">Published</Tabs.Tab>
							<Tabs.Tab value="unpublished">Unpublished</Tabs.Tab>
							{/* <Tabs.Tab value="deleted">Deleted At</Tabs.Tab> */}
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable reviews={filteredReviews} />
						</Tabs.Panel>

						{/* publish tab */}
						<Tabs.Panel value="published">
							<RenderTable reviews={filteredReviews} />
						</Tabs.Panel>

						{/* unpublish tab */}
						<Tabs.Panel value="unpublished">
							<RenderTable reviews={filteredReviews} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No review found</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({ reviews }: { reviews: ProductReviewProps[] }) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { totalPages, page, setPage, loading, setLoading, fetchReview } =
		useProductReview();
	const [viewDialogOpenId, setViewDialogOpenId] = useState<number | null>(null);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	const setReviewStatus = async (
		e: any,
		setStatus: "published" | "unpublished"
	) => {
		try {
			e.preventDefault();
			setLoading(true);
			const reviewId = e.target.dataset.reviewid;

			if (!authToken) return logout();

			if (setStatus === "published") {
				await productReviewService.publishReview(authToken, reviewId);
			} else if (setStatus === "unpublished") {
				await productReviewService.unPublishReview(authToken, reviewId);
			}

			await fetchReview();
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
		<Table className="border-collapse px-0 w-full">
			<TableCaption className="py-4 border border-t border-neutral-200">
				Showing {reviews.length} entries
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
					<TableHead>Product Name</TableHead>
					<TableHead>Customer Name</TableHead>
					<TableHead>Rating</TableHead>
					<TableHead>Published</TableHead>
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
					{reviews.map((review) => (
						<TableRow key={review.reviewId}>
							<TableCell className="pl-5">
								<Checkbox />
							</TableCell>
							<TableCell>{review.product.name}</TableCell>
							<TableCell>{review.customer.name}</TableCell>
							<TableCell>
								<div className="w-full text-yellow flex items-center justify-start">
									{Array.from({ length: 5 }).map((_, index) => (
										<Star
											key={index}
											size={15}
											className={
												index < review.rating ? "fill-current" : "text-gray"
											}
										/>
									))}
								</div>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<span className="sr-only">{review.status}</span>

											<Badge
												size="sm"
												variant={
													review.status === "published"
														? "success"
														: "destructive"
												}
											>
												{review.status}
											</Badge>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Status</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuCheckboxItem
												{...{
													"data-reviewid": review.reviewId,
												}}
												className="text-green-500"
												checked={review.status === "published"}
												onClick={(e) => setReviewStatus(e, "published")}
											>
												Published
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												{...{
													"data-reviewid": review.reviewId,
												}}
												className="text-rose-500"
												checked={review.status === "unpublished"}
												onClick={(e) => setReviewStatus(e, "unpublished")}
											>
												Unpublished
											</DropdownMenuCheckboxItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
							<TableCell>{new Date(review.createdAt).toDateString()}</TableCell>

							<TableCell className="space-x-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<span className="sr-only">Actions</span>
											<MoreHorizontal />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem
												onSelect={() => setViewDialogOpenId(review.reviewId)}
											>
												<Eye />
												View
											</DropdownMenuItem>
											<DropdownMenuItem
												onSelect={() => setDeleteDialogOpenId(review.reviewId)}
												className="text-rose-500"
											>
												<Trash />
												Delete
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* review view dialog */}
								<ReviewViewDialog
									review={review}
									isOpen={viewDialogOpenId === review.reviewId}
									setIsOpen={(isOpen) =>
										isOpen
											? setViewDialogOpenId(review.reviewId)
											: setViewDialogOpenId(null)
									}
								/>

								{/* review delete dialog */}
								<ReviewDeleteDialog
									isOpen={deleteDialogOpenId === review.reviewId}
									setIsOpen={(isOpen: boolean) =>
										isOpen
											? setDeleteDialogOpenId(review.reviewId)
											: setDeleteDialogOpenId(null)
									}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			)}
		</Table>
	);
};

const ReviewViewDialog = ({
	review,
	isOpen,
	setIsOpen,
}: {
	review: ProductReviewProps;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle>View Review</DialogTitle>
				</DialogHeader>

				<div key={review.reviewId} className="space-y-4 py-4">
					<div className="flex items-start justify-between gap-4">
						<Avatar>
							<AvatarImage src={AvatarImg} />
							<AvatarFallback>{review.customer.name}</AvatarFallback>
						</Avatar>
						<div className="w-full flex items-start justify-start gap-2 flex-col">
							<span className="text-base font-medium">
								{review.customer.name}
							</span>
							<div className="flex text-yellow">
								{Array.from({
									length: 5,
								}).map((_, index) => (
									<Star
										key={index}
										size={15}
										className={
											index < review.rating ? "fill-current" : "text-gray-300"
										}
									/>
								))}
							</div>
							<p className="text-gray-600 text-sm">
								{review.description}
								<br />
							</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const ReviewDeleteDialog = ({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This review will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive">Delete</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ProductReview;

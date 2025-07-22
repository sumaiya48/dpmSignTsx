import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash, Eye, MoreHorizontal, Download } from "lucide-react";
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
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { InqueryProps, useInquery } from "@/hooks/use-inquery";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { inqueryService } from "@/api";
import { downloadImagesAsZip } from "@/lib/utils";
import { AppPagination } from "@/components/ui/app-pagination";

const Inquery = () => {
	const {
		inqueries,
		setSearchTerm,
		searchBy,
		setSearchBy,
		inqueryType,
		setInqueryType,
		error,
	} = useInquery();
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

	const [filteredBy, setFilteredBy] = useState<"all" | "open" | "closed">(
		"all"
	);

	// Filter inquiries based on the selected tab
	const filteredInqueries = inqueries.filter((inquery) => {
		if (filteredBy === "all") return true;
		return inquery.status === filteredBy;
	});

	return (
		<section className="w-full py-5 px-2 space-y-4 ">
			{/* Heading */}
			<Header
				title="Inqueries"
				description="View and manage all customer inquiries in one place."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by ${searchBy}`}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Select onValueChange={(e) => setSearchBy(e as any)}>
					<SelectTrigger className="w-[150px]" defaultValue={searchBy}>
						<SelectValue placeholder="Search By" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="email">Email</SelectItem>
							<SelectItem value="phone">Phone</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select onValueChange={(e) => setInqueryType(e as any)}>
					<SelectTrigger className="w-[200px]" defaultValue={inqueryType}>
						<SelectValue placeholder="Select Inquery Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="product-information">
								Product Information
							</SelectItem>
							<SelectItem value="pricing">Pricing</SelectItem>
							<SelectItem value="customization-options">
								Customization Options
							</SelectItem>
							<SelectItem value="others">Others</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Header>

			{/* inquery table */}
			{inqueries.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="open">Open</Tabs.Tab>
							<Tabs.Tab value="closed">Closed</Tabs.Tab>
							{/* <Tabs.Tab value="deleted">Deleted At</Tabs.Tab> */}
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable filteredInqueries={filteredInqueries} />
						</Tabs.Panel>

						{/* publish tab */}
						<Tabs.Panel value="open">
							<RenderTable filteredInqueries={filteredInqueries} />
						</Tabs.Panel>

						{/* unpublish tab */}
						<Tabs.Panel value="closed">
							<RenderTable filteredInqueries={filteredInqueries} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">
						No inqueries found
					</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({
	filteredInqueries,
}: {
	filteredInqueries: InqueryProps[];
}) => {
	const { totalPages, page, setPage, loading, setLoading, fetchInqueries } =
		useInquery();
	const { authToken, user, logout } = useAuth();
	const { toast } = useToast();

	const [viewDialogOpenId, setViewDialogOpenId] = useState<number | null>(null);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	const setInqueryStatus = async (e: any, setStatus: "open" | "close") => {
		try {
			e.preventDefault();
			setLoading(true);
			const inqueryId = e.target.dataset.inqueryid;

			if (!authToken) return logout();

			if (setStatus === "close") {
				await inqueryService.closeInquery(authToken, inqueryId);
			} else if (setStatus === "open") {
				await inqueryService.openInquery(authToken, inqueryId);
			}

			await fetchInqueries();
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

	const deleteInquery = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			if (!deleteDialogOpenId) {
				return setDeleteDialogOpenId(null);
			}

			const response = await inqueryService.deleteInquery(
				authToken,
				deleteDialogOpenId
			);
			toast({
				description: response.message,
				variant: "success",
				duration: 10000,
			});

			await fetchInqueries();
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
				Showing {filteredInqueries.length} entries
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
				<TableRow className="w-full bg-slate-100 hover:bg-slate-100">
					<TableHead className="pl-3">
						<Checkbox />
					</TableHead>
					<TableHead>ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Phone</TableHead>
					<TableHead>Company</TableHead>
					<TableHead>Inquery Type</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Date of Creation</TableHead>
					<TableHead>Actions</TableHead>
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
				<TableBody className="w-full">
					{filteredInqueries.map((inquery) => (
						<TableRow className="w-full" key={inquery.inqueryId}>
							<TableCell className="pl-3">
								<Checkbox />
							</TableCell>
							<TableCell>{inquery.inqueryId}</TableCell>
							<TableCell>{inquery.name}</TableCell>
							<TableCell>{inquery.email}</TableCell>
							<TableCell>{inquery.phone}</TableCell>
							<TableCell>{inquery.company ? inquery.company : "N/A"}</TableCell>
							<TableCell>{inquery.inqueryType}</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="w-max">
											<span className="sr-only">{inquery.status}</span>

											<Badge
												size="sm"
												variant={
													inquery.status === "open" ? "success" : "default"
												}
											>
												{inquery.status}
											</Badge>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Status</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuCheckboxItem
												{...{
													"data-inqueryid": inquery.inqueryId,
												}}
												className="text-green-500"
												checked={inquery.status === "open"}
												onClick={(e) => setInqueryStatus(e, "open")}
											>
												Open
											</DropdownMenuCheckboxItem>
											<DropdownMenuCheckboxItem
												{...{
													"data-inqueryid": inquery.inqueryId,
												}}
												className="text-rose-500"
												checked={inquery.status === "closed"}
												onClick={(e) => setInqueryStatus(e, "close")}
											>
												Close
											</DropdownMenuCheckboxItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
							<TableCell>
								{new Date(inquery.createdAt).toDateString()}
							</TableCell>
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
												onSelect={() => setViewDialogOpenId(inquery.inqueryId)}
											>
												<Eye />
												View
											</DropdownMenuItem>
											{user?.role === "admin" && (
												<DropdownMenuItem
													className="text-rose-500"
													onSelect={() =>
														setDeleteDialogOpenId(inquery.inqueryId)
													}
												>
													<Trash />
													Delete
												</DropdownMenuItem>
											)}
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
								{/* view dialog */}
								<InqueryViewDialog
									inquery={inquery}
									isOpen={viewDialogOpenId === inquery.inqueryId}
									setIsOpen={(isOpen) => {
										isOpen
											? setViewDialogOpenId(inquery.inqueryId)
											: setViewDialogOpenId(null);
									}}
								/>

								{/* Delete Newsletter Dialog */}
								<InqueryDeleteDialog
									deleteInquery={deleteInquery}
									isOpen={deleteDialogOpenId === inquery.inqueryId}
									setIsOpen={(isOpen) =>
										isOpen
											? setDeleteDialogOpenId(inquery.inqueryId)
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

const InqueryViewDialog = ({
	inquery,
	isOpen,
	setIsOpen,
}: {
	inquery: InqueryProps;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[800px] max-h-[70vh] overflow-y-scroll">
				<DialogHeader>
					<DialogTitle className="pt-5">
						<div className="w-full flex items-start justify-between">
							<span>Inquery on {inquery.inqueryType}</span>
							<div className="flex items-center justify-between gap-2">
								<Badge
									size="sm"
									variant={inquery.status === "open" ? "success" : "default"}
								>
									{inquery.status}
								</Badge>
								<span className="text-sm font-normal text-gray/90">
									{new Date(inquery.createdAt).toDateString()}
								</span>
							</div>
						</div>
					</DialogTitle>
				</DialogHeader>

				<div key={inquery.inqueryId}>
					<div className="flex items-start justify-between gap-4">
						<div className="w-full flex items-start justify-start gap-2 flex-col">
							<div className="w-full flex items-start justify-start gap-0 flex-col">
								<div className="w-full flex items-center justify-between gap-2">
									<span className="text-lg font-semibold">{inquery.name}</span>

									<span className="text-sm font-normal text-gray/90">
										{inquery.company}
									</span>
								</div>
								<div className="w-full flex items-center justify-between gap-2">
									<span className="text-sm font-normal text-gray/90">
										{inquery.email}
									</span>

									<span className="text-sm font-normal text-gray/90">
										{inquery.phone}
									</span>
								</div>
							</div>
							<p className="text-gray-600 text-sm py-2">{inquery.message}</p>

							{inquery.images.length > 0 &&
								inquery.images.map((image) => (
									<div className="w-full flex items-start justify-center py-2">
										<img
											src={image.imageUrl}
											alt="Design File Image"
											className="rounded-lg "
										/>
									</div>
								))}
						</div>
					</div>
				</div>

				<DialogFooter>
					{inquery.images.length > 0 && (
						<Button
							variant="success"
							onClick={() => {
								downloadImagesAsZip(
									inquery.images.map((image) => image.imageUrl),
									`${inquery.inqueryId}-images.zip`
								);
							}}
						>
							<Download size={15} />
							Download Images
						</Button>
					)}
					<DialogClose asChild>
						<Button>Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const InqueryDeleteDialog = ({
	deleteInquery,
	isOpen,
	setIsOpen,
}: {
	deleteInquery: () => void;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure to delete this inquery?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete this
						inquery from the servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={deleteInquery}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Inquery;

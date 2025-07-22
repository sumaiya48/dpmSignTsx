import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Search,
	Trash,
	MoreHorizontal,
	FileSpreadsheet,
	FileText,
} from "lucide-react";
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
	AlertDialog,
	AlertDialogAction,
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
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { NewsletterProps, useNewsletter } from "@/hooks/use-newsletter";
import { useToast } from "@/hooks/use-toast";
import { newsletterService } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { AppPagination } from "@/components/ui/app-pagination";
import { createCSV, createExcelSheet } from "@/lib/utils";

const Newsletter = () => {
	const { newsletters, setSearchTerm, error } = useNewsletter();
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

	const [filteredBy, setFilteredBy] = useState<
		"all" | "verified" | "unverified"
	>("all");

	// Filter newsletter based on the selected tab
	const filteredNewsletters = newsletters.filter((newsletter) => {
		if (filteredBy === "all") return true;
		if (filteredBy === "verified") return newsletter.verified;
		return !newsletter.verified;
	});

	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = newsletters.map((newsletter) => ({
			ID: newsletter.newsletterId,
			Email: newsletter.email,
			Verified: newsletter.verified ? "Yes" : "No",
			"Date Added": new Date(newsletter.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "newsletter-subscribers");
		} else if (format === "csv") {
			createCSV(worksheetData, "newsletter-subscribers");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Newsletter"
				description="See all the newsletter subscriber of Dhaka Plastic & Metal."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by email`}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>
			</Header>

			{/* filter options */}
			{newsletters.length > 0 && (
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
				</div>
			)}

			{/* newsletter table */}
			{newsletters.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="verified">Verified</Tabs.Tab>
							<Tabs.Tab value="unverified">Unverified</Tabs.Tab>
							{/* <Tabs.Tab value="deleted">Deleted At</Tabs.Tab> */}
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable newsletters={filteredNewsletters} />
						</Tabs.Panel>

						{/* publish tab */}
						<Tabs.Panel value="verified">
							<RenderTable newsletters={filteredNewsletters} />
						</Tabs.Panel>

						{/* unpublish tab */}
						<Tabs.Panel value="unverified">
							<RenderTable newsletters={filteredNewsletters} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">
						No newsletter found
					</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({ newsletters }: { newsletters: NewsletterProps[] }) => {
	const { totalPages, page, setPage, loading, setLoading, fetchNewsletters } =
		useNewsletter();
	const { authToken, logout } = useAuth();
	const { toast } = useToast();
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	const deleteSubscriber = async () => {
		try {
			setLoading(true);
			if (!authToken) return logout();
			if (!deleteDialogOpenId) {
				return setDeleteDialogOpenId(null);
			}

			const email = newsletters.filter(
				(newsletter) => newsletter.newsletterId === deleteDialogOpenId
			)[0].email;

			const response = await newsletterService.deleteByEmail(authToken, email);
			toast({
				description: response.message,
				variant: "success",
				duration: 10000,
			});

			await fetchNewsletters();
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
				Showing {newsletters.length} entries
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
					<TableHead>Email</TableHead>
					<TableHead>Verification</TableHead>
					<TableHead>Date of Subscription</TableHead>
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
					{newsletters.map((newsletter) => (
						<TableRow key={newsletter.newsletterId}>
							<TableCell className="pl-5">
								<Checkbox />
							</TableCell>
							<TableCell>{newsletter.email}</TableCell>
							<TableCell>
								<Badge
									size="sm"
									variant={newsletter.verified ? "success" : "destructive"}
								>
									{newsletter.verified ? "verified" : "unverified"}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(newsletter.createdAt).toDateString()}
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
												className="text-rose-500"
												onSelect={() =>
													setDeleteDialogOpenId(newsletter.newsletterId)
												}
											>
												<Trash />
												Delete
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* Delete Newsletter Dialog */}
								<SubscriberDeleteDialog
									deleteSubscriber={deleteSubscriber}
									isOpen={deleteDialogOpenId === newsletter.newsletterId}
									setIsOpen={(isOpen) =>
										isOpen
											? setDeleteDialogOpenId(newsletter.newsletterId)
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

const SubscriberDeleteDialog = ({
	deleteSubscriber,
	isOpen,
	setIsOpen,
}: {
	deleteSubscriber: () => void;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure to delete this subscriber?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete this
						email from the newsletter subsriber servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={deleteSubscriber}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Newsletter;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Search,
	Trash,
	CirclePlus,
	Minus,
	Plus,
	MoreHorizontal,
	Pen,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
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
import Header from "@/components/header";
import { ChangeEvent, useEffect, useState } from "react";
import { FaqProps, useFaqs } from "@/hooks/use-faq";
import { LoadingOverlay } from "@mantine/core";
import { useFormValidation } from "@/hooks/use-form-validation";
import { faqService } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AppPagination } from "@/components/ui/app-pagination";

export interface FaqFormProps {
	faqId?: number;
	faqTitle: string;
	faqItems: FaqItemProps[];
}

export interface FaqItemProps {
	faqId?: number;
	faqItemId?: number;
	question: string;
	answer: string;
}

const FAQ = () => {
	const { faqs, totalPages, page, setPage, setSearchTerm, loading } = useFaqs();
	const [searchInput, setSearchInput] = useState<string>("");

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchInput]);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
	const [editDialogOpenId, setEditDialogOpenId] = useState<number | null>(null);

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Frequently Asked Questions"
				description="All the faq items of your website are listed here."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search by faq title"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Button onClick={() => setIsCreateDialogOpen(true)}>
					Create FAQ <CirclePlus size={15} />
				</Button>

				<FaqCreateDialog
					isOpen={isCreateDialogOpen}
					setIsOpen={setIsCreateDialogOpen}
				/>
			</Header>

			{/* FAQ Table */}
			{faqs.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Table className="border-collapse px-0 w-full">
						<TableCaption className="py-4 border border-t border-neutral-200">
							Showing {faqs.length} entries
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
								<TableHead>Title</TableHead>
								<TableHead>Total Questions</TableHead>
								<TableHead>Date Added </TableHead>
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
								{faqs.map((faq) => (
									<TableRow key={faq.faqId}>
										<TableCell className="pl-5">
											<Checkbox />
										</TableCell>
										<TableCell>{faq.faqTitle}</TableCell>

										<TableCell>{faq.faqItems.length}</TableCell>
										<TableCell>
											{new Date(faq.createdAt).toDateString()}
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
															onSelect={() => setEditDialogOpenId(faq.faqId)}
														>
															<Pen />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem className="text-rose-500">
															<Trash />
															Delete
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>

											<FaqEditDialog
												isOpen={editDialogOpenId === faq.faqId}
												setIsOpen={(isOpen) => {
													setEditDialogOpenId(isOpen ? faq.faqId : null);
												}}
												faq={faq}
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
					<p className="text-neutral-500 mb-6 font-medium">No faqs found</p>
				</div>
			)}
		</section>
	);
};

interface FaqCreateDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

const FaqCreateDialog = ({ isOpen, setIsOpen }: FaqCreateDialogProps) => {
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchFaqs } = useFaqs();
	const { toast } = useToast();
	const [faqFormData, setFaqFormData] = useState<FaqFormProps>({
		faqTitle: "",
		faqItems: [],
	});

	const { errors, validateField } = useFormValidation();

	const removeFaqItemHandler = (e: any) => {
		if (faqFormData.faqItems.length > 0) {
			const targetedIndex = Number(e.target.dataset.index);
			console.log(targetedIndex);
			if (typeof targetedIndex !== "number") return;

			setFaqFormData({
				...faqFormData,
				faqItems: faqFormData.faqItems.filter(
					(_item, itemIndex) => itemIndex !== targetedIndex
				),
			});
		}
	};

	const addFaqItemHandler = () => {
		setFaqFormData({
			...faqFormData,
			faqItems: [...faqFormData.faqItems, { question: "", answer: "" }],
		});
	};

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const faqTitleValue =
			e.target.name === "faqTitle" ? e.target.value : faqFormData.faqTitle;
		validateField("faqTitle", faqTitleValue, faqService.faqSchema);

		setFaqFormData({
			...faqFormData,
			faqTitle: faqTitleValue,
			faqItems: faqFormData.faqItems.map((faqItem, index) => {
				return {
					question:
						e.target.name === `faqQuestion-${index}`
							? e.target.value
							: faqItem.question,
					answer:
						e.target.name === `faqAnswer-${index}`
							? e.target.value
							: faqItem.answer,
				};
			}),
		});
	};

	const handleAction = async () => {
		try {
			setLoading(true);

			if (
				validateField("faqTitle", faqFormData.faqTitle, faqService.faqSchema)
			) {
				setFaqFormData((prevData) => ({
					...prevData,
					faqItems: faqFormData.faqItems.filter(
						(item) => item.question.length > 0 && item.answer.length > 0
					),
				}));

				if (!authToken) return logout();

				const response = await faqService.createFaq(
					authToken,
					faqFormData.faqTitle,
					faqFormData.faqItems
				);
				if (response.status === 200) {
					setLoading(false);
					toast({
						description: response.message,
						variant: "success",
						duration: 10000,
					});
				}

				// Reset the form data after successful action
				setFaqFormData({
					faqTitle: "",
					faqItems: [],
				});

				// Close the modal after successful action
				setIsOpen(false);

				await fetchFaqs();
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
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Create New FAQ</DialogTitle>
					<DialogDescription>
						<p className="text-xs">Manage your product's FAQ from here.</p>
					</DialogDescription>
				</DialogHeader>

				{loading && (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				)}

				<div className="w-full flex items-start justify-center flex-col gap-2 py-4">
					<Label htmlFor="faqTitle">
						Title
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="faqTitle"
						name="faqTitle"
						value={faqFormData.faqTitle}
						onChange={handleChange}
						error={errors.faqTitle ? true : false}
					/>

					{errors.faqTitle && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.faqTitle}
						</p>
					)}
				</div>

				{faqFormData.faqItems.map((faqItem, index) => {
					return (
						<div
							key={index}
							className="w-full flex items-start justify-center flex-col gap-2"
						>
							<div className="w-full flex items-center justify-between gap-2">
								<h5 className="text-base font-semibold">Item #{index + 1}</h5>

								<div
									className="flex items-center justify-center bg-rose-500/10 text-rose-500 p-2 rounded-sm cursor-pointer transition-all duration-300 hover:bg-rose-500/20 *:pointer-events-none"
									onClick={removeFaqItemHandler}
									data-index={index}
								>
									<Minus size={15} />
								</div>
							</div>

							<div className="w-full flex items-start justify-center flex-col gap-4">
								<div className="w-full space-y-1">
									<Label htmlFor={`faqQuestion-${index}`}>
										Question
										<span className="text-skyblue"> *</span>
									</Label>
									<Input
										id={`faqQuestion-${index}`}
										name={`faqQuestion-${index}`}
										value={faqItem.question}
										onChange={handleChange}
									/>
								</div>

								<div className="w-full space-y-1">
									<Label htmlFor={`faqAnswer-${index}`}>
										Answer <span className="text-skyblue"> *</span>
									</Label>
									<Textarea
										id={`faqAnswer-${index}`}
										name={`faqAnswer-${index}`}
										rows={5}
										value={faqItem.answer}
										onChange={handleChange}
									/>
								</div>
							</div>
						</div>
					);
				})}

				{errors.faqItems && (
					<p className="text-rose-500 font-medium text-xs">{errors.faqItems}</p>
				)}

				{/* Create New FAQ Item Button */}
				<div
					className="w-full my-2 flex items-center justify-center border-2rem border-dashed rounded-lg p-3 gap-2 cursor-pointer text-xs font-medium *:pointer-events-none"
					onClick={addFaqItemHandler}
				>
					<Plus size={15} />
					<p>Add New FAQ Item</p>
				</div>
				<DialogFooter>
					<Button
						disabled={
							faqFormData.faqItems.filter(
								(item) => item.question.length > 0 && item.answer.length > 0
							).length > 0
								? false
								: true
						}
						onClick={handleAction}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface FaqEditDialog {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	faq: FaqProps;
}

const FaqEditDialog = ({ isOpen, setIsOpen, faq }: FaqEditDialog) => {
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchFaqs } = useFaqs();
	const { toast } = useToast();
	const [faqFormData, setFaqFormData] = useState<FaqFormProps>({
		...faq,
		faqItems: faq?.faqItems.map((item) => {
			return {
				faqId: item.faqId,
				faqItemId: item.faqItemId,
				question: item.question,
				answer: item.answer,
			};
		}),
	});

	const { errors, validateField } = useFormValidation();

	// Reset form data when the modal is opened or closed
	useEffect(() => {
		if (faq) {
			setFaqFormData({
				...faq,
				faqItems: faq?.faqItems.map((item) => {
					return {
						faqId: item.faqId,
						faqItemId: item.faqItemId,
						question: item.question,
						answer: item.answer,
					};
				}),
			});
		}

		document.body.style.pointerEvents = "inherit";
	}, [isOpen, faq]);

	const removeFaqItemHandler = (e: any) => {
		if (faqFormData.faqItems.length > 0) {
			const targetedIndex = Number(e.target.dataset.index);
			if (typeof targetedIndex !== "number") return;

			setFaqFormData((prevData) => ({
				...prevData,
				faqItems: faqFormData.faqItems.filter(
					(item) =>
						item.faqItemId !== faqFormData.faqItems[targetedIndex].faqItemId
				),
			}));
		}
	};

	const addFaqItemHandler = () => {
		setFaqFormData({
			...faqFormData,
			faqItems: [...faqFormData.faqItems, { question: "", answer: "" }],
		});
	};

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const faqTitleValue =
			e.target.name === "faqTitle" ? e.target.value : faqFormData.faqTitle;
		validateField("faqTitle", faqTitleValue, faqService.faqSchema);

		setFaqFormData({
			...faqFormData,
			faqTitle: faqTitleValue,
			faqItems: faqFormData.faqItems.map((faqItem, index) => {
				return {
					faqId: faqFormData.faqId,
					faqItemId: faqItem.faqItemId,

					question:
						e.target.name === `faqQuestion-${index}`
							? e.target.value
							: faqItem.question,
					answer:
						e.target.name === `faqAnswer-${index}`
							? e.target.value
							: faqItem.answer,
				};
			}),
		});
	};

	const handleAction = async () => {
		try {
			setLoading(true);

			if (
				validateField("faqTitle", faqFormData.faqTitle, faqService.faqSchema)
			) {
				setFaqFormData((prevData) => ({
					...prevData,
					faqItems: faqFormData.faqItems.filter(
						(item) => item.question.length > 0 && item.answer.length > 0
					),
				}));

				if (!authToken) return logout();

				if (!faq) {
					toast({
						description: "Something went wrong. Please try again.",
						variant: "destructive",
						duration: 10000,
					});
					return;
				}

				const response = await faqService.updateFaq(
					authToken,
					faq.faqId,
					faqFormData.faqTitle,
					faqFormData.faqItems
				);

				if (response.status === 200) {
					setLoading(false);
					toast({
						description: response.message,
						variant: "success",
						duration: 10000,
					});
				}
				// Close the modal after successful action
				setIsOpen(false);

				await fetchFaqs();
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
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Edit FAQ</DialogTitle>
					<DialogDescription>
						<p className="text-xs">Manage your product's FAQ from here.</p>
					</DialogDescription>
				</DialogHeader>

				{loading && (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				)}

				<div className="w-full flex items-start justify-center flex-col gap-2 py-4">
					<Label htmlFor="faqTitle">
						Title
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="faqTitle"
						name="faqTitle"
						value={faqFormData.faqTitle}
						onChange={handleChange}
						error={errors.faqTitle ? true : false}
					/>

					{errors.faqTitle && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.faqTitle}
						</p>
					)}
				</div>

				{faqFormData.faqItems.map((faqItem, index) => {
					return (
						<div
							key={index}
							className="w-full flex items-start justify-center flex-col gap-2"
						>
							<div className="w-full flex items-center justify-between gap-2">
								<h5 className="text-base font-semibold">Item #{index + 1}</h5>

								<div
									className="flex items-center justify-center bg-rose-500/10 text-rose-500 p-2 rounded-sm cursor-pointer transition-all duration-300 hover:bg-rose-500/20 *:pointer-events-none"
									onClick={removeFaqItemHandler}
									data-index={index}
								>
									<Minus size={15} />
								</div>
							</div>

							<div className="w-full flex items-start justify-center flex-col gap-4">
								<div className="w-full space-y-1">
									<Label htmlFor={`faqQuestion-${index}`}>
										Question
										<span className="text-skyblue"> *</span>
									</Label>
									<Input
										id={`faqQuestion-${index}`}
										name={`faqQuestion-${index}`}
										value={faqItem.question}
										onChange={handleChange}
									/>
								</div>

								<div className="w-full space-y-1">
									<Label htmlFor={`faqAnswer-${index}`}>
										Answer <span className="text-skyblue"> *</span>
									</Label>
									<Textarea
										id={`faqAnswer-${index}`}
										name={`faqAnswer-${index}`}
										rows={5}
										value={faqItem.answer}
										onChange={handleChange}
									/>
								</div>
							</div>
						</div>
					);
				})}

				{errors.faqItems && (
					<p className="text-rose-500 font-medium text-xs">{errors.faqItems}</p>
				)}

				{/* Create New FAQ Item Button */}
				<div
					className="w-full my-2 flex items-center justify-center border-2rem border-dashed rounded-lg p-3 gap-2 cursor-pointer text-xs font-medium *:pointer-events-none"
					onClick={addFaqItemHandler}
				>
					<Plus size={15} />
					<p>Add New FAQ Item</p>
				</div>
				<DialogFooter>
					<Button
						disabled={
							faqFormData.faqItems.filter(
								(item) => item.question.length > 0 && item.answer.length > 0
							).length > 0
								? false
								: true
						}
						onClick={handleAction}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default FAQ;

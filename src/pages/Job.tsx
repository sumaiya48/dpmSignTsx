import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash, CirclePlus, MoreHorizontal, Pen } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AppPagination } from "@/components/ui/app-pagination";
import { JobProps, useJobs } from "@/hooks/use-job";
import { jobService } from "@/api";
import { Label } from "@/components/ui/label";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const mdParser = new MarkdownIt();

export interface JobFormProps {
	jobId?: number;
	title: string;
	content: string;
	jobLocation: string;
	applicationUrl: string;
	status: "open" | "closed";
}

const Job = () => {
	const { jobs, totalPages, page, setPage, setSearchTerm, loading } = useJobs();
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
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Career & Job Listing"
				description="Manage and curate your company's career opportunities."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search by job title"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Button onClick={() => setIsCreateDialogOpen(true)}>
					Add New Job <CirclePlus size={15} />
				</Button>

				<JobCreateDialog
					isOpen={isCreateDialogOpen}
					setIsOpen={setIsCreateDialogOpen}
				/>
			</Header>

			{/* Job Table */}
			{jobs.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Table className="border-collapse px-0 w-full">
						<TableCaption className="py-4 border border-t border-neutral-200">
							Showing {jobs.length} entries
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
								<TableHead>Location</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
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
								{jobs.map((job) => (
									<TableRow key={job.jobId}>
										<TableCell className="pl-5">
											<Checkbox />
										</TableCell>
										<TableCell>{job.title}</TableCell>

										<TableCell>{job.jobLocation}</TableCell>
										<TableCell>
											<Badge
												variant={
													job.status === "open" ? "success" : "destructive"
												}
												size="sm"
											>
												{job.status}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(job.createdAt).toDateString()}
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
															onSelect={() => setEditDialogOpenId(job.jobId)}
														>
															<Pen />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-rose-500"
															onSelect={() => setDeleteDialogOpenId(job.jobId)}
														>
															<Trash />
															Delete
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>

											<JobEditDialog
												isOpen={editDialogOpenId === job.jobId}
												setIsOpen={(isOpen) => {
													setEditDialogOpenId(isOpen ? job.jobId : null);
												}}
												job={job}
											/>

											<JobDeleteDialog
												jobId={job.jobId}
												isOpen={deleteDialogOpenId === job.jobId}
												setIsOpen={(isOpen) => {
													setDeleteDialogOpenId(isOpen ? job.jobId : null);
												}}
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
					<p className="text-neutral-500 mb-6 font-medium">No jobs found</p>
				</div>
			)}
		</section>
	);
};

interface JobCreateDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

const JobCreateDialog = ({ isOpen, setIsOpen }: JobCreateDialogProps) => {
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchJobs } = useJobs();
	const { toast } = useToast();
	const [jobFormData, setJobFormData] = useState<JobFormProps>({
		title: "",
		content: "",
		jobLocation: "",
		applicationUrl: "",
		status: "open",
	});

	const { errors, validateField, validateForm } = useFormValidation();

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		validateField(name, value, jobService.jobSchema);

		setJobFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		try {
			if (validateForm(jobFormData, jobService.jobSchema)) {
				setLoading(true);
				setJobFormData((prevData) => ({
					...prevData,
				}));

				if (!authToken) return logout();

				const response = await jobService.createJob(
					authToken,
					jobFormData.title,
					jobFormData.content,
					jobFormData.jobLocation,
					jobFormData.applicationUrl,
					jobFormData.status
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
				setJobFormData({
					title: "",
					content: "",
					jobLocation: "",
					applicationUrl: "",
					status: "open",
				});

				// Close the modal after successful action
				setIsOpen(false);

				await fetchJobs();
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
					<DialogTitle>Post a New Job</DialogTitle>

					<DialogDescription>
						<p className="text-">
							Fill out the details below to create a new job listing. Make sure
							the position title, description, and requirements are clear to
							attract the right candidates.
						</p>
					</DialogDescription>
				</DialogHeader>

				{loading && (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				)}

				<form className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title">
							Job Title
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="title"
							name="title"
							placeholder="e.g., Graphics Designer"
							value={jobFormData.title}
							onChange={handleChange}
							error={errors.title ? true : false}
						/>

						{errors.title && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.title}
							</p>
						)}
					</div>

					<div className="grid gap-2 space-y-2">
						<Label htmlFor="content">
							Content <span className="text-skyblue"> *</span>
						</Label>
						<div data-color-mode="light" className="w-full">
							<MdEditor
								readOnly={loading}
								value={jobFormData.content}
								style={{ height: "400px" }}
								renderHTML={(text) => mdParser.render(text)}
								onChange={({ text }) => {
									setJobFormData((prevData) => ({
										...prevData,
										content: text || "",
									}));
								}}
							/>

							{errors.content && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.content}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="jobLocation">
							Location
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="jobLocation"
							name="jobLocation"
							placeholder="e.g., Dhaka, Bangladesh"
							value={jobFormData.jobLocation}
							onChange={handleChange}
							error={errors.jobLocation ? true : false}
						/>

						{errors.jobLocation && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.jobLocation}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="applicationUrl">Application URL</Label>
						<Input
							id="applicationUrl"
							name="applicationUrl"
							placeholder="https://..."
							value={jobFormData.applicationUrl}
							onChange={handleChange}
							error={errors.applicationUrl ? true : false}
						/>

						{errors.applicationUrl && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.applicationUrl}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Select
							onValueChange={(e) =>
								setJobFormData((prev) => ({ ...prev, status: e as any }))
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select job status" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Status</SelectLabel>
									<SelectItem value="open">Open</SelectItem>
									<SelectItem value="closed">Closed</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</form>

				<DialogFooter>
					<Button onClick={handleSubmit}>Create Job Listing</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface JobEditDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	job: JobProps;
}

const JobEditDialog = ({ isOpen, setIsOpen, job }: JobEditDialogProps) => {
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchJobs } = useJobs();
	const { toast } = useToast();
	const [jobFormData, setJobFormData] = useState<JobFormProps>({
		...job,
	});

	const { errors, validateField, validateForm } = useFormValidation();

	// Reset form data when the modal is opened or closed
	useEffect(() => {
		if (job) {
			const { jobId, createdAt, updatedAt, ...rest } = job;
			setJobFormData({
				...rest,
			});
		}

		document.body.style.pointerEvents = "inherit";
	}, [isOpen, job]);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		validateField(name, value, jobService.jobSchema);

		setJobFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		try {
			if (validateForm(jobFormData, jobService.jobSchema)) {
				setLoading(true);
				setJobFormData((prevData) => ({
					...prevData,
				}));

				if (!authToken) return logout();

				if (!job || !job.jobId) {
					toast({
						description: "Something went wrong. Please try again.",
						variant: "destructive",
						duration: 10000,
					});
					return;
				}

				const response = await jobService.updateJob(
					authToken,
					job.jobId,
					jobFormData.title,
					jobFormData.content,
					jobFormData.jobLocation,
					jobFormData.applicationUrl,
					jobFormData.status
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

				await fetchJobs();
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
					<DialogTitle>Edit Job Post</DialogTitle>

					<DialogDescription>
						<p className="text-">
							Fill out the details below to create a new job listing. Make sure
							the position title, description, and requirements are clear to
							attract the right candidates.
						</p>
					</DialogDescription>
				</DialogHeader>

				{loading && (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				)}

				<form className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title">
							Job Title
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="title"
							name="title"
							placeholder="e.g., Graphics Designer"
							value={jobFormData.title}
							onChange={handleChange}
							error={errors.title ? true : false}
						/>

						{errors.title && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.title}
							</p>
						)}
					</div>

					<div className="grid gap-2 space-y-2">
						<Label htmlFor="content">
							Content <span className="text-skyblue"> *</span>
						</Label>
						<div data-color-mode="light" className="w-full">
							<MdEditor
								readOnly={loading}
								value={jobFormData.content}
								style={{ height: "400px" }}
								renderHTML={(text) => mdParser.render(text)}
								onChange={({ text }) => {
									setJobFormData((prevData) => ({
										...prevData,
										content: text || "",
									}));
								}}
							/>

							{errors.content && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.content}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="jobLocation">
							Location
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							id="jobLocation"
							name="jobLocation"
							placeholder="e.g., Dhaka, Bangladesh"
							value={jobFormData.jobLocation}
							onChange={handleChange}
							error={errors.jobLocation ? true : false}
						/>

						{errors.jobLocation && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.jobLocation}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="applicationUrl">Application URL</Label>
						<Input
							id="applicationUrl"
							name="applicationUrl"
							placeholder="https://..."
							value={jobFormData.applicationUrl}
							onChange={handleChange}
							error={errors.applicationUrl ? true : false}
						/>

						{errors.applicationUrl && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.applicationUrl}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Select
							defaultValue={jobFormData.status}
							onValueChange={(e) =>
								setJobFormData((prev) => ({ ...prev, status: e as any }))
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select job status" />
							</SelectTrigger>
							<SelectContent defaultValue={jobFormData.status}>
								<SelectGroup>
									<SelectLabel>Status</SelectLabel>
									<SelectItem value="open">Open</SelectItem>
									<SelectItem value="closed">Closed</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</form>

				<DialogFooter>
					<Button onClick={handleSubmit}>Update</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface JobDeleteDialogProps {
	jobId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JobDeleteDialog = ({
	jobId,
	isOpen,
	setIsOpen,
}: JobDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchJobs } = useJobs();

	const deleteJob = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await jobService.deleteByJobId(authToken, jobId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchJobs();
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
						This action cannot be undone. This courier will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteJob}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Job;

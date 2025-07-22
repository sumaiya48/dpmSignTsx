import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import Header from "@/components/header";
import {
	CirclePlus,
	LinkIcon,
	SquareArrowOutUpRight,
	Trash,
	Upload,
} from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useMedia } from "@/hooks/use-media";
import { useToast } from "@/hooks/use-toast";
import { mediaService } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { LoadingOverlay } from "@mantine/core";
import { Link } from "react-router-dom";

const Media = () => {
	const { medias, loading, setLoading, error, fetchMedias } = useMedia();
	const [deleteImageLoading, setDeleteImageLoading] = useState<boolean>(false);
	const { authToken, logout } = useAuth();

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

	const [mediaImages, setMediaImages] = useState<File[]>([]);
	const [copied, setCopied] = useState<boolean>(false);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);

			setMediaImages([...mediaImages, ...files]);
		}
	};

	const handleUpload = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await mediaService.addMedia(authToken, mediaImages);

			toast({
				description: response.message,
				variant: "success",
				duration: 10000,
			});

			setMediaImages([]);
			await fetchMedias();
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

	const handleDelete = async () => {
		try {
			setDeleteImageLoading(true);

			if (!authToken) return logout();

			if (!deleteDialogOpenId) {
				return;
			}

			const response = await mediaService.deleteMedia(
				authToken,
				deleteDialogOpenId
			);

			toast({
				description: response.message,
				variant: "success",
				duration: 10000,
			});

			setDeleteDialogOpenId(null);
			await fetchMedias();
		} catch (err: any) {
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setDeleteImageLoading(false);
		}
	};

	const handleCopy = async (imageUrl: string) => {
		try {
			await navigator.clipboard.writeText(imageUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	return (
		<section className="w-full py-5  space-y-4 px-2 ">
			{/* Heading */}
			<Header
				title="Media"
				description="All images of your store in one place!"
			>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							Add Image <CirclePlus size={15} />
						</Button>
					</DialogTrigger>
					{loading && (
						<>
							<LoadingOverlay
								visible={loading}
								zIndex={10}
								overlayProps={{ radius: "xs", blur: 1 }}
							/>
						</>
					)}

					<DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Add New Image</DialogTitle>
							<DialogDescription>
								Make sure the image is in high quality and must be jpg, png or
								jpeg format.
							</DialogDescription>
						</DialogHeader>
						<div className="w-full flex flex-col items-start justify-start gap-4">
							{mediaImages.length < 20 && (
								<Label
									className="relative w-full h-40 border-dashed border-[3px] border-gray/30 hover:border-skyblue/80 transition-all duration-300 cursor-pointer rounded-lg flex items-start justify-center flex-col gap-1.5"
									htmlFor="media-image"
								>
									<Input
										id="media-image"
										type="file"
										multiple
										accept="image/*"
										className="w-full h-full pointer-events-none hidden"
										onChange={handleFileChange}
										name="media-image"
									/>
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 flex items-center justify-center flex-col gap-3">
										<Upload />
										<span className="text-sm cursor-pointer">
											Click to upload images. Max 20 images.
										</span>
									</div>
								</Label>
							)}

							{mediaImages && (
								<div className="w-full h-auto grid grid-cols-3 gap-2">
									{mediaImages.map((mediaImage, index) => (
										<div
											key={index}
											className="flex items-start justify-center flex-col gap-2 overflow-hidden"
										>
											<img
												className="w-36 h-36 rounded-md"
												src={URL.createObjectURL(mediaImage)}
												alt="Not Found"
											/>

											<Button
												size="xs"
												variant="destructive"
												onClick={() => {
													setMediaImages(
														mediaImages.filter(
															(_, itemIndex) => itemIndex !== index
														)
													);
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
						<DialogFooter>
							<DialogClose asChild>
								<Button
									onClick={handleUpload}
									disabled={mediaImages.length === 0 ? true : false}
								>
									Add Image
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</Header>

			{/* Media Content */}
			{medias.length > 0 ? (
				<div className="w-full grid grid-cols-6 gap-4 py-2">
					{medias.map((media, index) => (
						<div
							key={index}
							className="w-full h-auto rounded-lg overflow-hidden bg-slate-100/60 flex items-center justify-center flex-col gap-2"
						>
							<div
								data-media-image-id={media.imageId}
								className="group w-full h-60 overflow-hidden rounded-lg flex items-center justify-center relative cursor-pointer"
								onClick={() => setDeleteDialogOpenId(media.imageId)}
							>
								<div className="absolute top-0 left-0 h-full w-full bg-neutral-800/50 text-white items-center justify-center transition-all duration-300 ease-in-out hidden group-hover:flex group-hover:visible">
									<Button size="icon" className="pointer-events-none">
										<Trash />
									</Button>
								</div>
								<img
									src={media.imageUrl}
									className="max-w-full object-cover object-center"
								/>
							</div>

							<AlertDialog
								open={deleteDialogOpenId === media.imageId}
								onOpenChange={(isOpen) =>
									isOpen
										? setDeleteDialogOpenId(media.imageId)
										: setDeleteDialogOpenId(null)
								}
							>
								<AlertDialogContent>
									{deleteImageLoading && (
										<>
											<LoadingOverlay
												visible={deleteImageLoading}
												zIndex={10}
												overlayProps={{ radius: "xs", blur: 1 }}
											/>
										</>
									)}

									<AlertDialogHeader>
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This image will no longer be
											accessible by you or others.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<Button variant="destructive" onClick={handleDelete}>
											Delete
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							<div className="w-full flex items-center justify-between p-4">
								<Link to={media.imageUrl} target="_blank">
									<Button size="icon">
										<SquareArrowOutUpRight size={20} />
									</Button>
								</Link>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												size="icon"
												onClick={() => handleCopy(media.imageUrl)}
											>
												<LinkIcon size={20} />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>{copied ? "Copied!" : "Copy image URL"}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No media found</p>
				</div>
			)}
		</section>
	);
};

export default Media;

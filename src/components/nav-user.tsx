import {
	ChevronsUpDown,
	Eye,
	EyeClosed,
	LogOut,
	Trash,
	Upload,
	UserPen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { AuthContextProps, useAuth, UserType } from "@/hooks/use-auth";
import AvatarImg from "@/assets/images/avatar.png";
import { LoadingOverlay } from "@mantine/core";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useFormValidation } from "@/hooks/use-form-validation";
import { userProfileService } from "@/api";
import { useDisclosure } from "@mantine/hooks";
import { useToast } from "@/hooks/use-toast";

interface EditProfileFormDataProps {
	avatar: File | null;
	name: string;
	currentPassword: string;
	newPassword: string;
	phone: string;
}

const NavUser = ({
	user,
	logout,
}: {
	user: UserType;
	logout: AuthContextProps["logout"];
}) => {
	const { isMobile } = useSidebar();
	const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] =
		useState<boolean>(false);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-full">
								<AvatarImage
									src={user?.avatarUrl || AvatarImg}
									alt={user?.name}
								/>
								<AvatarFallback className="rounded-full">
									{user?.name}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user?.name}</span>
								<span className="truncate text-xs">{user?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user?.avatarUrl ? user?.avatarUrl : AvatarImg}
										alt={user?.name}
									/>
									<AvatarFallback className="rounded-lg">
										{user?.name}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user?.name}</span>
									<span className="truncate text-xs">{user?.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => setIsEditProfileDialogOpen(true)}
							>
								<UserPen />
								Edit Profile
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={logout}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<EditProfileDialog
					isEditProfileDialogOpen={isEditProfileDialogOpen}
					setIsEditProfileDialogOpen={setIsEditProfileDialogOpen}
					user={user}
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

const EditProfileDialog = ({
	isEditProfileDialogOpen,
	setIsEditProfileDialogOpen,
	user,
}: {
	isEditProfileDialogOpen: boolean;
	setIsEditProfileDialogOpen: (isOpen: boolean) => void;
	user: UserType;
}) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const [loading, setLoading] = useDisclosure(false);
	const [showCurrentPassword, setShowCurrentPassword] =
		useState<boolean>(false);
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [keepPrivousAvatar, setKeepPreviousAvatar] = useState<boolean | null>(
		user?.avatarUrl ? true : null
	);

	const [editProfileFormData, setEditProfileFormData] =
		useState<EditProfileFormDataProps>({
			avatar: null,
			name: user?.name || "",
			currentPassword: "",
			newPassword: "",
			phone: user?.phone || "",
		});
	const { errors, validateField, validateForm } = useFormValidation();

	const handleEditProfileFormData = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;

		setEditProfileFormData({
			...editProfileFormData,
			[name]: value,
		});
		validateField(name, value, userProfileService.editProfileSchema);
	};

	const handleUpdate = async () => {
		try {
			if (
				validateForm(editProfileFormData, userProfileService.editProfileSchema)
			) {
				setLoading.open();

				if (!authToken || !user) return logout();

				if (!keepPrivousAvatar) {
					setEditProfileFormData({
						...editProfileFormData,
						avatar: null,
					});
				}

				const response = await userProfileService.updateProfile(
					authToken,
					user?.role,
					editProfileFormData.avatar,
					keepPrivousAvatar,
					editProfileFormData.name,
					editProfileFormData.currentPassword,
					editProfileFormData.newPassword,
					editProfileFormData.phone
				);

				if (response.status === 200) {
					toast({
						description:
							response.message || "Your profile updated successfully.",
						variant: "success",
						duration: 10000,
					});

					setTimeout(() => {
						return logout();
					}, 2000);
				}
			}
		} catch (err: any) {
			console.log(err);

			setLoading.close();
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		}
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			setEditProfileFormData({
				...editProfileFormData,
				avatar: file,
			});
			setKeepPreviousAvatar(false);
		}
	};

	useEffect(() => {
		setKeepPreviousAvatar(true);
		setEditProfileFormData({
			...editProfileFormData,
			avatar: null,
			currentPassword: "",
			newPassword: "",
		});

		document.body.style.pointerEvents = "inherit";
	}, [isEditProfileDialogOpen]);

	return (
		<Dialog
			open={isEditProfileDialogOpen}
			onOpenChange={setIsEditProfileDialogOpen}
		>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Make changes to update your profile.
					</DialogDescription>
				</DialogHeader>

				<LoadingOverlay
					visible={loading}
					zIndex={10}
					overlayProps={{ blur: 2 }}
				/>

				<div className="w-full flex items-start justify-center flex-col gap-4 pb-2">
					{/* avatar image */}
					{user?.avatarUrl && keepPrivousAvatar ? (
						<>
							<div className="group w-20 h-20 overflow-hidden rounded-lg flex items-center justify-center relative cursor-pointer">
								<div
									className="absolute top-0 left-0 h-full w-full bg-neutral-800/50 text-white items-center justify-center transition-all duration-300 ease-in-out hidden group-hover:flex group-hover:visible"
									onClick={() => {
										setEditProfileFormData({
											...editProfileFormData,
											avatar: null,
										});
										setKeepPreviousAvatar(false);
									}}
								>
									<Button size="icon" className="pointer-events-none">
										<Trash />
									</Button>
								</div>
								<img
									src={user.avatarUrl}
									className="max-w-full object-cover object-center"
								/>
							</div>
						</>
					) : (
						<div className="w-full h-52 grid grid-cols-2 gap-2">
							<Label
								className="relative w-full h-full border-dashed border-[3px] border-gray/30 hover:border-skyblue/80 transition-all duration-300 cursor-pointer rounded-lg flex items-start justify-center flex-col gap-1.5"
								htmlFor="avatar"
							>
								<Input
									id="avatar"
									name="avatar"
									type="file"
									accept="image/*"
									className="w-full h-full pointer-events-none hidden"
									onChange={handleFileChange}
								/>
								<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col gap-3">
									<Upload />
									<span className="text-sm cursor-pointer">
										Click to upload your avatar
									</span>
								</div>
							</Label>

							{editProfileFormData.avatar && (
								<div className="w-full h-full flex items-center justify-center">
									<img
										className="h-52 max-w-full object-center object-contain"
										src={URL.createObjectURL(editProfileFormData.avatar)}
										alt="Not Found"
									/>
								</div>
							)}
						</div>
					)}

					<div className="w-full flex items-start justify-center flex-col gap-2">
						<Label htmlFor="name" className="cursor-pointer">
							Name
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							type="text"
							id="name"
							name="name"
							value={editProfileFormData.name}
							onChange={handleEditProfileFormData}
							error={errors.name ? true : false}
						/>

						{errors.name && (
							<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
						)}
					</div>

					<div className="w-full flex items-start justify-center flex-col gap-2">
						<Label htmlFor="currentPassword" className="cursor-pointer">
							Current Password
							<span className="text-skyblue"> *</span>
						</Label>
						<div className="flex w-full items-center space-x-2 relative">
							<Input
								type={showCurrentPassword ? "text" : "password"}
								id="currentPassword"
								name="currentPassword"
								value={editProfileFormData.currentPassword}
								onChange={handleEditProfileFormData}
								error={errors.currentPassword ? true : false}
							/>
							{showCurrentPassword ? (
								<EyeClosed
									size={20}
									className="cursor-pointer text-gray absolute right-5"
									onClick={() => setShowCurrentPassword(false)}
								/>
							) : (
								<Eye
									size={20}
									className="cursor-pointer text-gray absolute right-5"
									onClick={() => setShowCurrentPassword(true)}
								/>
							)}
						</div>

						{errors.currentPassword && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.currentPassword}
							</p>
						)}
					</div>

					<div className="w-full flex items-start justify-center flex-col gap-2">
						<Label htmlFor="newPassword" className="cursor-pointer">
							New Password
							<span className="text-skyblue"> *</span>
						</Label>
						<div className="flex w-full items-center space-x-2 relative">
							<Input
								type={showNewPassword ? "text" : "password"}
								id="newPassword"
								name="newPassword"
								placeholder="leave blank if you do not want to change your password"
								value={editProfileFormData.newPassword}
								onChange={handleEditProfileFormData}
								error={errors.newPassword ? true : false}
							/>
							{showNewPassword ? (
								<EyeClosed
									size={20}
									className="cursor-pointer text-gray absolute right-5"
									onClick={() => setShowNewPassword(false)}
								/>
							) : (
								<Eye
									size={20}
									className="cursor-pointer text-gray absolute right-5"
									onClick={() => setShowNewPassword(true)}
								/>
							)}
						</div>

						{errors.newPassword && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.newPassword}
							</p>
						)}
					</div>

					<div className="w-full flex items-start justify-center flex-col gap-2">
						<Label htmlFor="phone" className="cursor-pointer">
							Phone
							<span className="text-skyblue"> *</span>
						</Label>
						<Input
							type="text"
							id="phone"
							name="phone"
							placeholder="017......."
							value={editProfileFormData.phone}
							onChange={handleEditProfileFormData}
							error={errors.phone ? true : false}
						/>

						{errors.phone && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.phone}
							</p>
						)}
					</div>
				</div>
				<DialogFooter>
					<DialogClose>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button onClick={handleUpdate}>Update</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default NavUser;

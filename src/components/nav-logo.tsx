import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import LogoIcon from "@/assets/images/icon.svg";

const NavLogo = () => {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<img src={LogoIcon} alt={"logo"} className="size-10" />
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">
							Dhaka Plastic & Metal
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

export default NavLogo;

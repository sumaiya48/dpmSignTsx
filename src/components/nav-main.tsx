import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

import {
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDown } from "lucide-react";
import { SidebarMenuType } from "@/hooks/use-nav-sidebar";

const NavMain = ({ menus }: { menus: SidebarMenuType[] }) => {
	const { open, toggleSidebar } = useSidebar();

	return (
		<SidebarGroup>
			<SidebarMenu>
				{menus.map((menu, menuIndex) => {
					return (
						<>
							{menu.items && menu.items?.length > 0 ? (
								<SidebarMenuItem key={menuIndex}>
									<Collapsible
										defaultOpen={menu.isActive ? true : false}
										className="group/collapsible w-full"
									>
										<CollapsibleTrigger className="w-full">
											<SidebarMenuButton tooltip={menu.title}>
												{!open ? (
													<>
														<menu.icon onClick={() => toggleSidebar()} />
													</>
												) : (
													<>
														<menu.icon className="pointer-events-none" />
														{menu.title}
														<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
													</>
												)}
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{menu.items.map((menuItem, menuItemIndex) => (
													<SidebarMenuSubItem key={menuItemIndex}>
														<Link to={menuItem.url}>
															<SidebarMenuSubButton
																isActive={menuItem.isActive}
															>
																<menuItem.icon className="pointer-events-none" />
																{menuItem.title}
															</SidebarMenuSubButton>
														</Link>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</Collapsible>
								</SidebarMenuItem>
							) : (
								<SidebarMenuItem key={menuIndex}>
									<Link to={menu.url}>
										<SidebarMenuButton
											tooltip={menu.title}
											isActive={menu.isActive}
										>
											{menu.icon && (
												<>
													<menu.icon className="pointer-events-none" />
												</>
											)}
											<span>{menu.title}</span>
										</SidebarMenuButton>
									</Link>
								</SidebarMenuItem>
							)}
						</>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default NavMain;

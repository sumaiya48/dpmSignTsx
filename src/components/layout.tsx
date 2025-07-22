import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { NavSidebarProvider } from "@/hooks/use-nav-sidebar";
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from "react";
import ProgressBar from "@/components/progress-bar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useMatch } from "react-router-dom";
import routes, { Routes } from "@/routes";
import { socket } from "@/lib/socket";
import { useToast } from "@/hooks/use-toast";
import { CustomerProps } from "@/hooks/use-customer";
import { OrderProps } from "@/hooks/use-order";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const { toast } = useToast();
	const { authToken } = useAuth();

	const location = useLocation();
	const isInvoicePage = useMatch("/invoice/:orderId");

	// Update meta tags when the location changes
	useEffect(() => {
		const updateMetaTags = (routesObj: Routes) => {
			for (const key in routesObj) {
				const route = routesObj[key];
				if (route.path === location.pathname) {
					document.title = route.title; // Update title
					return;
				}

				if (typeof route === "object" && !Array.isArray(route)) {
					updateMetaTags(route);
				}
			}
		};

		updateMetaTags(routes);
	}, [location]);

	// Update meta tags on initial render
	useEffect(() => {
		const updateMetaTags = (routesObj: Routes) => {
			for (const key in routesObj) {
				const route = routesObj[key];
				if (route.path === location.pathname) {
					document.title = route.title; // Update title
					return;
				}

				if (typeof route === "object" && !Array.isArray(route)) {
					updateMetaTags(route);
				}
			}
		};

		updateMetaTags(routes);

		// Listen for new customers
		socket.on("register-customer", (_customer: CustomerProps) => {
			toast({
				description: "New Customer just registered!!",
				variant: "success",
				duration: 10000,
			});
		});

		// Listen for new order request create
		socket.on("create-order-request", (_order: OrderProps) => {
			toast({
				description: "New order request just created!!",
				variant: "success",
				duration: 10000,
			});
		});

		// Clean up the event listener
		return () => {
			socket.off("register-customer");
			socket.off("create-order-request");
		};
	}, []);

	if (isInvoicePage) {
		return <>{children}</>;
	}

	return (
		<>
			{authToken ? (
				<>
					<ProgressBar />
					<NavSidebarProvider>
						<SidebarProvider>
							<AppSidebar />
							<main className="w-full px-1 scrollbar-thick">
								<SidebarTrigger />
								{children}
							</main>
							<Toaster />
						</SidebarProvider>
					</NavSidebarProvider>
				</>
			) : (
				<>
					{children}
					<Toaster />
				</>
			)}
		</>
	);
};

export default Layout;

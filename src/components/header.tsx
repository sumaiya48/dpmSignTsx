// import {
// 	Sheet,
// 	SheetContent,
// 	SheetDescription,
// 	SheetHeader,
// 	SheetTitle,
// 	SheetFooter,
// 	SheetClose,
// 	SheetTrigger,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Bell } from "lucide-react";
// import Notification from "@/components/notification";
// import routes from "@/routes";
import React from "react";

export interface HeaderProps {
	title: string;
	description?: string;
	children?: React.ReactNode;
}

const Header = ({ title, description, children }: HeaderProps) => {
	return (
		<div className="bg-slate-100/60 backdrop-blur-lg rounded-lg grid grid-cols-2 py-4 px-8">
			{/* Left Column */}
			<div className="">
				<h2 className="text-2xl font-semibold">{title}</h2>
				<p className="text-sm font-normal">{description}</p>
			</div>

			{/* Right Column */}
			<div className="flex items-center justify-end gap-3">
				{children}

				{/* Notification Panel */}
				{/* <Sheet>
					<SheetTrigger asChild>
						<div className="flex items-center justify-center cursor-pointer *:pointer-events-none hover:text-skyblue transition-all duration-300">
							<div className="relative after:content-[''] after:w-[6px] after:h-[6px] after:rounded-full after:bg-orange-500 after:absolute after:top-0 after:-right-0">
								<Bell size={20} />
							</div>
						</div>
					</SheetTrigger>
					<SheetContent className="pt-10">
						<SheetHeader>
							<SheetTitle>Notifications</SheetTitle>
							<SheetDescription>
								Here is a list of recent notifications.
							</SheetDescription>
						</SheetHeader>

						<div className="w-full flex items-center justify-center gap-2 flex-col py-5">
							<Notification
								title="A new customer just registered!"
								description="lorem ipsum dolre sit amet. quino inqa bit orpsen."
								actionButton={{
									label: "See Customers",
									path: routes.customer.path,
								}}
							/>
						</div>

						<SheetFooter>
							<SheetClose asChild>
								<Button>Clear</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet> */}
			</div>
		</div>
	);
};

export default Header;

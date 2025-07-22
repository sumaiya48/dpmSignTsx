import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

// Type for the Breadcrumb component props
interface BreadcrumbProps extends React.HTMLProps<HTMLElement> {}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
	({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />
);
Breadcrumb.displayName = "Breadcrumb";

// Type for the BreadcrumbList component props
interface BreadcrumbListProps extends React.OlHTMLAttributes<HTMLOListElement> {
	className?: string;
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
	({ className, ...props }, ref) => (
		<ol
			ref={ref}
			className={cn(
				"flex flex-wrap items-center gap-1.5 break-words text-sm text-neutral-500 sm:gap-2.5 dark:text-neutral-400",
				className
			)}
			{...props}
		/>
	)
);
BreadcrumbList.displayName = "BreadcrumbList";

// Type for the BreadcrumbItem component props
interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
	className?: string;
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
	({ className, ...props }, ref) => (
		<li
			ref={ref}
			className={cn("inline-flex items-center gap-1.5", className)}
			{...props}
		/>
	)
);
BreadcrumbItem.displayName = "BreadcrumbItem";

// Type for the BreadcrumbLink component props
interface BreadcrumbLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	asChild?: boolean;
	className?: string;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
	({ asChild, className, ...props }, ref) => {
		const Comp: React.ElementType =
			asChild && typeof asChild === "boolean" ? Slot : "a";

		return (
			<Comp
				ref={ref as React.Ref<HTMLAnchorElement>}
				className={cn(
					"transition-colors hover:text-neutral-950 dark:hover:text-neutral-50",
					className
				)}
				{...props}
			/>
		);
	}
);
BreadcrumbLink.displayName = "BreadcrumbLink";

// Type for the BreadcrumbPage component props
interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
	className?: string;
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
	({ className, ...props }, ref) => (
		<span
			ref={ref}
			role="link"
			aria-disabled="true"
			aria-current="page"
			className={cn(
				"font-normal text-neutral-950 dark:text-neutral-50",
				className
			)}
			{...props}
		/>
	)
);
BreadcrumbPage.displayName = "BreadcrumbPage";

// Type for the BreadcrumbSeparator component props
interface BreadcrumbSeparatorProps
	extends React.LiHTMLAttributes<HTMLLIElement> {
	className?: string;
	children?: React.ReactNode;
}

const BreadcrumbSeparator = ({
	children,
	className,
	...props
}: BreadcrumbSeparatorProps) => (
	<li
		role="presentation"
		aria-hidden="true"
		className={cn("[&>svg]:w-5 [&>svg]:h-5", className)}
		{...props}
	>
		{children ?? <ChevronRight />}
	</li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// Type for the BreadcrumbEllipsis component props
interface BreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLElement> {
	className?: string;
}

const BreadcrumbEllipsis = ({
	className,
	...props
}: BreadcrumbEllipsisProps) => (
	<span
		role="presentation"
		aria-hidden="true"
		className={cn("flex h-9 w-9 items-center justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More</span>
	</span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};

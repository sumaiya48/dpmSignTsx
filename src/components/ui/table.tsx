import * as React from "react";
import { cn } from "@/lib/utils";

// Table Component
const Table = React.forwardRef<
	HTMLTableElement,
	React.HTMLProps<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<div className="relative w-full overflow-auto">
		<table
			ref={ref}
			className={cn("w-full caption-bottom text-sm", className)}
			{...props}
		/>
	</div>
));
Table.displayName = "Table";

// TableHeader Component
const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLProps<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

// TableBody Component
const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLProps<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn("[&_tr:last-child]:border-0", className)}
		{...props}
	/>
));
TableBody.displayName = "TableBody";

// TableFooter Component
const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLProps<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn(
			"border-t bg-neutral-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-neutral-800/50",
			className
		)}
		{...props}
	/>
));
TableFooter.displayName = "TableFooter";

// TableRow Component
const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLProps<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			"border-b border-neutral-300 transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800",
			className
		)}
		{...props}
	/>
));
TableRow.displayName = "TableRow";

// TableHead Component
const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.HTMLProps<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			"h-10 px-2 text-left align-middle font-medium text-neutral-900 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] dark:text-neutral-200",
			className
		)}
		{...props}
	/>
));
TableHead.displayName = "TableHead";

// TableCell Component
const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.HTMLProps<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className
		)}
		{...props}
	/>
));
TableCell.displayName = "TableCell";

// TableCaption Component
const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLProps<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cn(
			"mt-4 text-sm text-neutral-500 dark:text-neutral-400",
			className
		)}
		{...props}
	/>
));
TableCaption.displayName = "TableCaption";

// Export all the components
export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};

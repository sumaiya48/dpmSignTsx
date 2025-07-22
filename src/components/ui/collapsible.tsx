import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export interface CollapsibleProps
	extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {}

const Collapsible = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Root>,
	CollapsibleProps
>(({ children, ...props }, ref) => (
	<CollapsiblePrimitive.Root ref={ref} {...props}>
		{children}
	</CollapsiblePrimitive.Root>
));
Collapsible.displayName = CollapsiblePrimitive.Root.displayName;

export interface CollapsibleTriggerProps
	extends React.ComponentPropsWithoutRef<
		typeof CollapsiblePrimitive.Trigger
	> {}

const CollapsibleTrigger = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
	CollapsibleTriggerProps
>(({ children, ...props }, ref) => (
	<CollapsiblePrimitive.Trigger ref={ref} {...props}>
		{children}
	</CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

export interface CollapsibleContentProps
	extends React.ComponentPropsWithoutRef<
		typeof CollapsiblePrimitive.Content
	> {}

const CollapsibleContent = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Content>,
	CollapsibleContentProps
>(({ children, ...props }, ref) => (
	<CollapsiblePrimitive.Content ref={ref} {...props}>
		{children}
	</CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

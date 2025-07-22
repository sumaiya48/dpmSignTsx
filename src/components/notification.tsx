import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface NotificationProps {
	title: string;
	description?: string;
	actionButton?: {
		label: string;
		path: string;
	};
}

const Notification = ({
	title,
	description,
	actionButton,
}: NotificationProps) => {
	return (
		<>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription className="w-full flex items-center justify-between">
						{description && (
							<p className="text-xs font-medium">{description}</p>
						)}
						{actionButton && (
							<Button size="sm" variant="link">
								<Link to={actionButton?.path}>
									{actionButton?.label}
								</Link>
							</Button>
						)}
					</CardDescription>
				</CardHeader>
			</Card>
		</>
	);
};

export default Notification;

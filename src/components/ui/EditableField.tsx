// Documentation: EditableField component provides an editable text area with save and cancel options.
// It allows inline editing of text content and triggers an 'onSave' callback with the updated value.
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pen } from "lucide-react";

interface EditableFieldProps {
	value: string;
	label: string;
	onSave: (value: string) => void;
}

const EditableField = ({ value, label, onSave }: EditableFieldProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);

	// Documentation: Handles saving the edited value and exiting edit mode.
	const handleSave = () => {
		onSave(editValue);
		setIsEditing(false);
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-col items-start justify-between gap-1">
				<span className="font-semibold flex-grow">{label}:</span>
				{isEditing ? (
					<div className="w-full flex-grow space-y-3">
						<Textarea
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							className="min-h-[100px] w-full"
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={handleSave}>
								Save
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between w-full">
						<p className="text-neutral-600 flex-grow">{value}</p>
						<Button
							variant="ghost"
							size="sm"
							className="opacity-100"
							onClick={() => setIsEditing(true)}
						>
							<Pen size={12} />
							Edit
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default EditableField;

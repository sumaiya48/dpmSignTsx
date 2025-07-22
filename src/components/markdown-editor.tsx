import { useState } from "react";
import { Bold, Italic, Link, List, Underline, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import MarkdownPreview from "@/components/markdown-preview";

export interface MarkdownEditorProps {
	onSubmit?: (content: string) => void;
	onCancel?: () => void;
	contentMD: string;
}

type FormatType = "bold" | "italic" | "underline" | "link" | "list";

const MarkdownEditor = ({
	onSubmit,
	onCancel,
	contentMD,
}: MarkdownEditorProps) => {
	const [content, setContent] = useState<string>(contentMD);
	const [isPreview, setIsPreview] = useState<boolean>(true);

	const handleFormat = (format: FormatType) => {
		const formats = {
			bold: { prefix: "**", suffix: "**" },
			italic: { prefix: "_", suffix: "_" },
			underline: { prefix: "<u>", suffix: "</u>" },
			link: { prefix: "[text](", suffix: ")" },
			list: { prefix: "- ", suffix: "" },
		};

		const textarea = document.querySelector("textarea");
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);
		const { prefix, suffix } = formats[format];

		const newContent =
			content.substring(0, start) +
			prefix +
			(selectedText || "text") +
			suffix +
			content.substring(end);

		setContent(newContent);
	};

	const handleSubmit = () => {
		if (content.trim()) {
			onSubmit && onSubmit(content);
			setContent("");
			setIsPreview(false);
		}
	};

	return (
		<Card className="py-4 bg-slate-100/40 backdrop-blur-lg shadow-sm border-gray/50">
			<div className="space-y-2">
				<div className="w-full">
					<div className="w-full flex justify-between  border-b border-gray/50 pb-2">
						{!isPreview && (
							<ToggleGroup
								type="multiple"
								className="flex flex-wrap"
							>
								<ToggleGroupItem
									value="bold"
									aria-label="Toggle bold"
									onClick={() => handleFormat("bold")}
								>
									<Bold className="h-4 w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem
									value="italic"
									aria-label="Toggle italic"
									onClick={() => handleFormat("italic")}
								>
									<Italic className="h-4 w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem
									value="underline"
									aria-label="Toggle underline"
									onClick={() => handleFormat("underline")}
								>
									<Underline className="h-4 w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem
									value="link"
									aria-label="Insert link"
									onClick={() => handleFormat("link")}
								>
									<Link className="h-4 w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem
									value="list"
									aria-label="Toggle list"
									onClick={() => handleFormat("list")}
								>
									<List className="h-4 w-4" />
								</ToggleGroupItem>
							</ToggleGroup>
						)}

						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsPreview(!isPreview)}
						>
							{isPreview ? (
								<>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</>
							) : (
								<>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</>
							)}
						</Button>
					</div>

					{isPreview ? (
						<div className="p-4">
							<MarkdownPreview content={content} />
						</div>
					) : (
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Write your content..."
							className="border-0 focus-visible:ring-0 resize-none"
							rows={20}
						/>
					)}
				</div>

				<div className="flex justify-end gap-2 px-2">
					{onCancel && (
						<Button variant="outline" size="sm" onClick={onCancel}>
							Cancel
						</Button>
					)}
					{!isPreview && (
						<Button
							onClick={handleSubmit}
							variant="success"
							size="sm"
						>
							Save
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
};

export default MarkdownEditor;

import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import MarkdownEditor from "@/components/markdown-editor";

interface PolicyProps {
	title: string;
	description?: string;
	content?: string;
}

const Policy = ({ title, description, content }: PolicyProps) => {
	const contentMD =
		"`const` is for variables that should not be reassigned, `let` is for variables scoped to a block, and `var` is function-scoped but outdated.";
	console.log(content);

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header title={title} description={description}>
				<div className="truncate flex items-center space-x-2 relative">
					<Input className="pr-12" id="search" placeholder="Search" />
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>
			</Header>

			<div className="w-full border border-neutral-200 rounded-lg">
				<MarkdownEditor contentMD={contentMD} />
			</div>
		</section>
	);
};

export default Policy;

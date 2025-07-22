import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

const StepTimeline = ({ steps }: { steps: any[] }) => {
	return (
		<section className="py-10">
			<div className="row py-4 flex items-start justify-center flex-col xl:flex-row">
				{steps.map((step, index) => {
					return (
						<div
							key={step.id}
							className="flex items-start flex-col gap-0 relative"
						>
							<div
								className={cn(
									"border-2 border-skyblue w-10 h-10 rounded-full text-lg font-semibold flex items-center justify-center absolute top-0 z-10 after:content-[''] after:w-1 after:h-8 after:bg-skyblue after:top-full after:left-0 after:transform after:-translate-x-1/2 after:hidden",
									step.completed
										? "bg-skyblue text-white"
										: "bg-white text-skyblue/50 border-skyblue/50"
								)}
							>
								<span>
									{step.completed ? (
										<Check size={24} />
									) : (
										<X size={24} />
									)}
								</span>
							</div>
							<div
								className={cn(
									"ml-[1.1rem] xl:mt-[1.1rem] pl-10 pt-2 xl:pt-4 pb-10 xl:pr-8 w-full flex items-start justify-around flex-col gap-1",
									index === steps.length - 1
										? "border-l-0 xl:border-t-4 border-transparent xl:border-skyblue/50"
										: "border-l-4 border-t-0 xl:border-l-0 xl:border-t-4",
									step.completed
										? "border-skyblue xl:border-skyblue"
										: "border-skyblue/50"
								)}
							>
								<h3 className="text-lg">{step.title}</h3>
								<h6 className="text-base text-gray">
									31 January 2024
								</h6>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default StepTimeline;

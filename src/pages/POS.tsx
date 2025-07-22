import POSLayout from "@/components/pos/pos-layout";

const POS = () => {
	return (
		<section className="w-full py-2  space-y-4 overflow-x-scroll ">
			{/* Heading */}
			{/* <Header
				title="POS System"
				description="This is the point of sale system."
			></Header> */}

			<div className="">
				<POSLayout />
			</div>
		</section>
	);
};

export default POS;

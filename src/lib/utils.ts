import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Variant, VariantDetail, Variation } from "@/pages/AddProduct";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const createExcelSheet = (data: any, sheetName: string) => {
	// 2. Create a worksheet
	const worksheet = XLSX.utils.json_to_sheet(data);

	// 3. Create a workbook and append the worksheet
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

	// 4. Trigger the file download
	XLSX.writeFile(workbook, `${sheetName}.xlsx`);
};

export const createCSV = (data: any[], fileName: string) => {
	const csv = Papa.unparse(data);

	// Create a Blob and trigger download
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", `${fileName}.csv`);
	document.body.appendChild(link);
	link.click();

	// Cleanup
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const createSlug = (str: string) => {
	return slugify(str, { lower: true });
};

export const getGreeting = () => {
	const hour = new Date().getHours();

	if (hour >= 5 && hour < 12) {
		return "Good Morning";
	} else if (hour >= 12 && hour < 17) {
		return "Good Afternoon";
	} else if (hour >= 17 && hour < 21) {
		return "Good Evening";
	} else {
		return "Good Night";
	}
};

export const downloadImage = async (imageUrl: string, fileName: string) => {
	try {
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		const blobUrl = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(blobUrl); // Clean up
	} catch (error: any) {
		console.log(error.message);
		throw new Error("Error downloading image.");
	}
};

export const downloadImagesAsZip = async (
	imageUrls: string[],
	zipFileName: string = "images.zip"
) => {
	try {
		const zip = new JSZip();
		const folder = zip.folder("images");

		// Fetch all images and add to zip
		const fetchPromises = imageUrls.map(async (url: string, index: number) => {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
			const blob = await response.blob();
			const fileExtension = url?.split(".")?.pop()?.split("?")[0];
			const fileName = `image_${index + 1}.${fileExtension}`;
			folder?.file(fileName, blob);
		});

		await Promise.all(fetchPromises);

		// Generate zip and trigger download
		const zipBlob = await zip.generateAsync({ type: "blob" });
		saveAs(zipBlob, zipFileName);
	} catch (err: any) {
		console.error("Error downloading images: ", err.message);
		throw new Error("Error downloading images.");
	}
};

/**
 * Generates all possible combinations of variation items
 */
export const generateProductVariantCombinations = (
	variations: Variation[]
): VariantDetail[][] => {
	if (variations.length === 0) return [];

	// Start with the first variation's items
	let result: VariantDetail[][] = variations[0].variationItems.map((item) => [
		{
			variationName: variations[0].name,
			variationItemValue: item.value,
		},
	]);

	// For each additional variation, combine with existing results
	for (let i = 1; i < variations.length; i++) {
		const variation = variations[i];
		const newResult: VariantDetail[][] = [];

		// For each existing combination
		for (const combo of result) {
			// For each item in the current variation
			for (const item of variation.variationItems) {
				// Create a new combination by adding this item
				newResult.push([
					...combo,
					{
						variationName: variation.name,
						variationItemValue: item.value,
					},
				]);
			}
		}

		// Replace result with new combinations
		result = newResult;
	}

	return result;
};

/**
 * Generates all product variants from variations
 */
export const generateVariants = (variations: Variation[]): Variant[] => {
	const combinations = generateProductVariantCombinations(variations);

	return combinations.map((variantDetails, index) => ({
		id: index + 1,
		additionalPrice: 0,
		variantDetails,
	}));
};

export const formatPrice = (amount: number): string => {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

export const calculateSquareFeet = (
	width: number,
	height: number,
	unit: "feet" | "inches" = "feet"
): number => {
	let widthFeet = width;
	let heightFeet = height;

	if (unit === "inches") {
		widthFeet = width / 12;
		heightFeet = height / 12;
	}

	return parseFloat((widthFeet * heightFeet).toFixed(2));
};

export const generateNumericUUID = (length: number): number => {
	const numbersOnly = uuidv4().replace(/\D/g, ""); // strip non-digits
	let result = numbersOnly;

	// If not enough digits, chain a few UUIDs until we have enough
	while (result.length < length) {
		result += uuidv4().replace(/\D/g, "");
	}

	return parseInt(result.slice(0, length));
};

export const handleReactToPdf = async (
	element: HTMLDivElement,
	fileName = "document.pdf"
) => {
	const canvas = await html2canvas(element, {
		scale: 4, // Better quality
		useCORS: true, // handle images/fonts if needed
		logging: false,
	});

	const imgData = canvas.toDataURL("image/png");

	const pdf = new jsPDF("p", "mm", "a4");

	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

	pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
	pdf.save(fileName);
};

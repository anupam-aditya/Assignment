const express = require("express");
const app = express();
const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const sharp = require("sharp");
const multer = require("multer");

const storageDir = "storage";

if (!fs.existsSync(storageDir)) {
	fs.mkdirSync(storageDir);
}

const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
	const requestID = uuidv4();
	const csvFilePath = req.file.path;
	const productData = [];

	await new Promise((resolve, reject) => {
		fs.createReadStream(csvFilePath)
			.pipe(csv())
			.on("data", (row) => {
				console.log(row);
				const product = {
					serialNumber: row["Serial Number"],
					productName: row["Product Name"],
					inputImageUrls: row["Input Image Urls"].split(","),
					status: "pending",
				};
				productData.push(product);
			})
			.on("end", () => {
				resolve();
			})
			.on("error", (err) => {
				reject(err);
			});
	});

	const promises = productData.map(async (product) => {
		const outputImageUrls = [];
		for (const inputImageUrl of product.inputImageUrls) {
			const outputImageUrl = await compressImage(
				inputImageUrl,
				product.serialNumber
			);
			outputImageUrls.push(outputImageUrl);
		}
		product.outputImageUrls = outputImageUrls;
		product.status = "processed";
	});

	await Promise.all(promises);

	const productDataWithOutput = productData.map((product) => ({
		serialNumber: product.serialNumber,
		productName: product.productName,
		inputImageUrls: product.inputImageUrls,
		outputImageUrls: product.outputImageUrls,
		status: product.status,
	}));

	fs.writeFileSync(
		`${storageDir}/${requestID}.json`,
		JSON.stringify({ productData: productDataWithOutput, status: "processed" })
	);

	res.send({ requestID });
});

app.get("/status/:requestID", (req, res) => {
	const requestID = req.params.requestID;
	const filePath = `${storageDir}/${requestID}.json`;
	if (fs.existsSync(filePath)) {
		const { productData, status } = JSON.parse(
			fs.readFileSync(filePath, "utf-8")
		);
		if (status === "pending") {
			const csvData = [
				[
					"Serial Number",
					"Product Name",
					"Input Image Urls",
					"Output Image Urls",
					"Status",
				],
			];
			productData.forEach((product) => {
				csvData.push([
					product.serialNumber,
					product.productName,
					product.inputImageUrls.join(","),
					"",
					"pending",
				]);
			});
			const csvString = csvData.map((row) => row.join(",")).join("\n");
			res.setHeader("Content-Type", "text/csv");
			res.setHeader("Content-Disposition", "attachment; filename=status.csv");
			res.send(csvString);
		} else {
			const csvData = [
				[
					"Serial Number",
					"Product Name",
					"Input Image Urls",
					"Output Image Urls",
					"Status",
				],
			];
			productData.forEach((product) => {
				csvData.push([
					product.serialNumber,
					product.productName,
					product.inputImageUrls.join(","),
					product.outputImageUrls.join(","),
					product.status,
				]);
			});
			const csvString = csvData.map((row) => row.join(",")).join("\n");
			res.setHeader("Content-Type", "text/csv");
			res.setHeader("Content-Disposition", "attachment; filename=status.csv");
			res.send(csvString);
		}
	} else {
		res.status(404).send({ message: "Request not found" });
	}
});

async function compressImage(imageUrl, serialNumber) {
	const response = await fetch(imageUrl);
	const buffer = Buffer.from(await response.arrayBuffer());
	const compressedBuffer = await compressImageBuffer(buffer);
	const compressedImageUrl = await saveImage(compressedBuffer, serialNumber);
	return compressedImageUrl;
}

async function compressImageBuffer(buffer) {
	const compressedBuffer = await sharp(buffer)
		.resize({ width: 100 })
		.jpeg({ quality: 50 })
		.toBuffer();
	return compressedBuffer;
}

async function saveImage(buffer, serialNumber) {
	const fileName = `${serialNumber}-${uuidv4()}.jpg`;
	const filePath = path.join(storageDir, fileName);
	await fs.promises.writeFile(filePath, buffer);
	return `/${fileName}`;
}

app.listen(3000, () => {
	console.log("Server started on port 3000");
});

import axios from "axios";
import fs from "graceful-fs";
import path from "path";
import { getTextFromPDF } from "./textract.js";

// Function to download a PDF from a given URL
const downloadPdf = async (url, outputPath) => {
  try {
    // Send a GET request to the URL
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    // Create a writable stream to save the PDF file
    const writer = fs.createWriteStream(outputPath);

    // Pipe the response data to the file
    response.data.pipe(writer);

    // Return a promise that resolves when the file is fully written
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading the PDF: ${error.message}`);
  }
};

(async () => {
  const pdfUrl = "https://campusvisit.osu.edu/four-ways.pdf";
  const outputFilePath = path.join(path.resolve(), "sample.pdf");

  await downloadPdf(pdfUrl, outputFilePath);
  console.log("PDF downloaded successfully");

  // upload downloaded PDF to S3

  const text = await getTextFromPDF(outputFilePath);
  console.log(text);
})();

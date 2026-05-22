const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractFromDocument = async (file) => {
  try {
    const mimeType = file.mimetype;

    // PDF
    if (mimeType === "application/pdf") {
      try {
        const buffer = fs.readFileSync(file.path);

        const data = await pdfParse(buffer);

        return {
          type: "text",
          content: data.text || "",
          mimeType,
        };
      } catch (pdfError) {
        console.log("PDF parse failed");

        return {
          type: "text",
          content: "Unable to read PDF properly.",
          mimeType,
        };
      }
    }

    // IMAGE
    if (mimeType.startsWith("image/")) {
      return {
        type: "text",
        content:
          "Flight booking image uploaded. Extract visible travel details.",
        mimeType,
      };
    }

    return {
      type: "text",
      content: "",
      mimeType,
    };
  } catch (error) {
    console.error("Extractor error:", error);

    return {
      type: "text",
      content: "",
      mimeType: file.mimetype,
    };
  }
};

module.exports = { extractFromDocument };
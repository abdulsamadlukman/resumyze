import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    lib.GlobalWorkerOptions.workerSrc = workerSrc;
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

// export async function convertPdfToImage(
//   file: File
// ): Promise<PdfConversionResult> {
  
//   try {
//     const lib = await loadPdfJs();

//     const arrayBuffer = await file.arrayBuffer();
//     const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
//     const page = await pdf.getPage(1);

//     const viewport = page.getViewport({ scale: 4 });
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");

//     canvas.width = viewport.width;
//     canvas.height = viewport.height;

//     if (context) {
//       context.imageSmoothingEnabled = true;
//       context.imageSmoothingQuality = "high";
//     }

//     await page.render({ canvasContext: context!, viewport }).promise;

//     return new Promise((resolve) => {
//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             // Create a File from the blob with the same name as the pdf
//             const originalName = file.name.replace(/\.pdf$/i, "");
//             const imageFile = new File([blob], `${originalName}.png`, {
//               type: "image/png",
//             });

//             resolve({
//               imageUrl: URL.createObjectURL(blob),
//               file: imageFile,
//             });
//           } else {
//             resolve({
//               imageUrl: "",
//               file: null,
//               error: "Failed to create image blob",
//             });
//           }
//         },
//         "image/png",
//         1.0
//       ); // Set quality to maximum (1.0)
//     });
//   } catch (err) {
//     return {
//       imageUrl: "",
//       file: null,
//       error: `Failed to convert PDF: ${err}`,
//     };
//   }
// }




export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log("1. Starting conversion");

    const lib = await loadPdfJs();
    console.log("2. PDF.js loaded");

    const arrayBuffer = await file.arrayBuffer();
    console.log("3. File read");

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log("4. PDF opened");

    const page = await pdf.getPage(1);
    console.log("5. Page loaded");

    const viewport = page.getViewport({ scale: 4 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context is null");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    console.log("6. About to render page");

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    console.log("7. Page rendered");

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log("8. toBlob callback");

        if (blob) {
          console.log("9. Blob created");

          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
          });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        } else {
          resolve({
            imageUrl: "",
            file: null,
            error: "Failed to create image blob",
          });
        }
      });
    });
  } catch (err) {
    console.error("FULL PDF ERROR:", err);

    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
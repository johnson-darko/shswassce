import { PDFUpload } from "@/components/PDFUpload";

export default function PDFAdmin() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          PDF Requirements Parser
        </h1>
        <p className="text-gray-600 text-center">
          Upload university admission requirements PDFs to automatically extract program data
        </p>
      </div>
      <PDFUpload />
    </div>
  );
}
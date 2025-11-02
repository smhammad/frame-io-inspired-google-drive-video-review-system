import Button from "./ui/button";
import { Download } from "lucide-react";

export default function ExportButton({ comments, exportComments }) {
  return (
    <Button onClick={() => exportComments(comments)} title="Export CSV">
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
}

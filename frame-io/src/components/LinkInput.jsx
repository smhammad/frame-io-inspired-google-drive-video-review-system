import { useState } from "react";
import Input from "./ui/input";
import Button from "./ui/button";
import { convertDriveLink } from "../utils/driveUtils";
import { Link as LinkIcon } from "lucide-react";

export default function LinkInput({ onLoad }) {
  const [link, setLink] = useState("");

  const handleLoad = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    // Remove any trailing spaces or newlines
    const trimmedLink = link.trim();
    if (!trimmedLink) {
      alert("Please enter a Google Drive link");
      return;
    }

    const playableUrl = convertDriveLink(trimmedLink);
    if (playableUrl) {
      onLoad(playableUrl);
      setLink(""); // Clear input after successful load
    } else {
      alert("Please paste a valid Google Drive file link (…/file/d/<ID>/view).");
    }
  };

  return (
    <form onSubmit={handleLoad} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <Button type="submit" className="px-5">Load</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Tip: Anyone-with-link (Viewer) must be enabled in Drive for playback.
      </p>
    </form>
  );
}

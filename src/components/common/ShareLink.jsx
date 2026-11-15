import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ShareLink({ path, query = "", label = "form" }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}${path}${query}`);
  }, [path, query]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || `${path}${query}`);
      toast.success(`Share link copied — send it to anyone you want to sign up`);
    } catch {
      toast.error("Could not copy the link — open the form and copy it from the address bar");
    }
  }

  function open() {
    window.open(`${path}${query}`, "_blank", "noopener");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="hidden max-w-[280px] truncate rounded-lg bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground sm:block">
        {url || `${path}${query}`}
      </p>
      <Button size="sm" onClick={copy}>
        <Copy className="mr-1.5 h-3.5 w-3.5" /> Share link
      </Button>
      <Button variant="outline" size="sm" onClick={open}>
        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open {label}
      </Button>
    </div>
  );
}
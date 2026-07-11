"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteMediaAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

interface MediaRow {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
  uploader: { name: string | null; username: string };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaTable({ files }: { files: MediaRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, filename: string) {
    if (!confirm(`Delete "${filename}" from the media library?`)) return;
    startTransition(async () => {
      await deleteMediaAction(id);
      router.refresh();
    });
  }

  if (files.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No uploaded media yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Preview</th>
            <th className="px-4 py-3 text-left font-medium">File</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Uploader</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Size</th>
            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Uploaded</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                  {file.mimeType.startsWith("image/") ? (
                    <Image
                      src={file.url}
                      alt={file.filename}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {file.mimeType.split("/")[1]?.slice(0, 4) ?? "file"}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="max-w-[200px] truncate font-medium">{file.filename}</p>
                <p className="text-xs text-muted-foreground">{file.mimeType}</p>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {file.uploader.name ?? file.uploader.username}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {formatBytes(file.size)}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                {file.createdAt.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(file.id, file.filename)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

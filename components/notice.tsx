"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function Notice({
  message,
  error
}: {
  message?: string | null;
  error?: string | null;
}) {
  useEffect(() => {
    if (error) {
      toast.error("Hubo un error", { description: error });
    } else if (message) {
      toast.success(message);
    }
  }, [error, message]);

  return null;
}

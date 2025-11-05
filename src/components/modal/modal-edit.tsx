// app/admin/fields/field-edit-modal.tsx

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Field } from "@/types";

interface FieldEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedField: Field | null;
  customDescription?: string;
  tittle: string;
  children: React.ReactNode; // <-- Tempat untuk FieldEditForm
}

export function FieldEditModal({
  open,
  onOpenChange,
  selectedField,
  customDescription,
  tittle,
  children,
}: FieldEditModalProps) {
  if (!selectedField) return null;

  return (
    <Dialog  open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className="">
          <DialogTitle>{tittle}</DialogTitle>
          <DialogDescription>
            {customDescription ||
              `Ubah detail untuk lapangan "${selectedField.name}".`}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

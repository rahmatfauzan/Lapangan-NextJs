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
  selected: any;
  customDescription?: string;
  tittle?: string;
  children: React.ReactNode; // <-- Tempat untuk FieldEditForm
}

export function EditModal({
  open,
  onOpenChange,
  selected,
  customDescription,
  tittle,
  children,
}: FieldEditModalProps) {
  if (!selected) return null;

  return (
    <Dialog  open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className="">
          <DialogTitle>{tittle}</DialogTitle>
          <DialogDescription>
            {customDescription}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

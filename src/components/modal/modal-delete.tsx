// app/admin/fields/field-delete-modal.tsx

"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Field } from "@/types";

interface FieldDeleteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: any | null;
    customDescription?: string;
    swrKeyPrefix: string;
    onConfirm: () => Promise<void>; // Handler delete dari parent
    isMutating: boolean; // State loading dari parent
}

export function DeleteModal({
    open,
    onOpenChange,
    selected,
    swrKeyPrefix,
    customDescription,
    onConfirm,
    isMutating,
}: FieldDeleteModalProps) {
    
    if (!selected) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hapus Lapangan</DialogTitle>
                    <DialogDescription>
                        {customDescription || (
                            <>
                                Apakah anda yakin untuk menghapus lapangan 
                                <strong> "{selected.name}"</strong> secara permanen? Aksi ini tidak bisa dibatalkan.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="pt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={isMutating} 
                    >
                        Batal
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={isMutating}
                    >
                        {isMutating ? "Menghapus..." : "Ya, Hapus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
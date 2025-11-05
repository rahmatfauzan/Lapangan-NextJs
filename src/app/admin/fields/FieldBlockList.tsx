"use client";

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { Field, FieldBlock } from '@/types';
import { blocksFetcher, deleteFieldBlock } from '@/lib/services/field.service';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Untuk format tanggal Indonesia

interface FieldBlockListProps {
  field: Field;
}

export function FieldBlockList({ field }: FieldBlockListProps) {
  const swrKey = `/api/admin/fields/${field.id}/blocks`;
  const { data: blocks, error, isLoading, mutate } = useSWR<FieldBlock[]>(swrKey, blocksFetcher);
  
  // (Kita gunakan 'mutate' global jika SWR key ini tidak ada di SWRConfig)
  // const { mutate } = useSWRConfig(); 

  const handleDelete = async (block: FieldBlock) => {
    if (!confirm(`Yakin ingin menghapus blokir: "${block.reason}"?`)) {
      return;
    }
    
    try {
      await deleteFieldBlock(block.id);
      toast.success("Sukses!", { description: "Jadwal blokir telah dibatalkan." });
      mutate(); // Refresh daftar blokir ini
    } catch (err) {
      toast.error("Gagal", { description: "Gagal membatalkan blokir." });
    }
  };

  if (isLoading) return <div className="text-center p-4">Memuat jadwal blokir...</div>;
  if (error) return <div className="text-destructive p-4">Gagal memuat data.</div>;
  if (!blocks || blocks.length === 0) {
    return <div className="text-center text-muted-foreground p-4">Tidak ada jadwal blokir untuk lapangan ini.</div>;
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {blocks.map((block) => (
        <div key={block.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
          <div>
            <p className="font-semibold">{block.reason}</p>
            <p className="text-sm text-muted-foreground">
              {/* Format tanggal: 06 Nov 2025, 09:00 - 11:00 */}
              {format(new Date(block.start_datetime), "dd MMM yyyy, HH:mm", { locale: id })} - 
              {format(new Date(block.end_datetime), "HH:mm")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(block)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
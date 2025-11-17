// lib/store/useMabarEditStore.ts
import { create } from "zustand";
import { MabarSession } from "@/types";
import { EditFormData } from "../services/mabar-edit.service";

interface MabarState {
  // Session data
  session: MabarSession | null;
  isLoading: boolean;
  error: string | null;

  // Edit mode
  editMode: boolean;
  editForm: EditFormData;
  isUpdating: boolean;

  // Cover image
  coverImageFile: File | null;
  coverImagePreview: string;

  // Modals
  showAddModal: boolean;
  showImageModal: boolean;
  selectedImage: string;

  // Basic Actions
  setSession: (session: MabarSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Edit actions
  setEditMode: (mode: boolean) => void;
  updateEditForm: (partial: Partial<EditFormData>) => void;
  setIsUpdating: (updating: boolean) => void;
  enterEditMode: () => void;
  cancelEdit: () => void;

  // Cover image actions
  setCoverImageFile: (file: File | null) => void;
  setCoverImagePreview: (preview: string) => void;
  removeCoverImage: () => void;

  // Modal actions
  viewPaymentProof: (imageUrl: string) => void;
  closeImageModal: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;

  // Computed values
  getStats: () => {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalRevenue: number;
    fillRate: number;
    remainingSlots: number;
  };
}

const defaultEditForm: EditFormData = {
  title: "",
  description: "",
  slots_total: 0,
  price_per_slot: 0,
  cover_image: "",
  payment_instructions: "",
};

export const useMabarStore = create<MabarState>((set, get) => ({
  // Initial state
  session: null,
  isLoading: false,
  error: null,
  editMode: false,
  editForm: defaultEditForm,
  isUpdating: false,
  coverImageFile: null,
  coverImagePreview: "",
  showAddModal: false,
  showImageModal: false,
  selectedImage: "",

  // Session actions
  setSession: (session) => {
    set({ session });
    if (session) {
      set({
        editForm: {
          title: session.title || "",
          description: session.description || "",
          slots_total: session.slots_total || 0,
          price_per_slot: session.price_per_slot || 0,
          payment_instructions: session.payment_instructions || "",
          cover_image: session.cover_image || "",
        },
        coverImagePreview: session.cover_image || "",
      });
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Edit actions
  setEditMode: (editMode) => set({ editMode }),
  updateEditForm: (partial) =>
    set((state) => ({
      editForm: { ...state.editForm, ...partial },
    })),
  setIsUpdating: (isUpdating) => set({ isUpdating }),

  enterEditMode: () => set({ editMode: true }),

  cancelEdit: () => {
    const { session } = get();
    if (session) {
      set({
        editMode: false,
        editForm: {
          title: session.title,
          description: session.description || "",
          slots_total: session.slots_total,
          price_per_slot: session.price_per_slot,
          payment_instructions: session.payment_instructions,
          cover_image: session.cover_image || "",
        },
        coverImagePreview: session.cover_image || "",
        coverImageFile: null,
      });
    }
  },

  // Cover image actions
  setCoverImageFile: (coverImageFile) => set({ coverImageFile }),
  setCoverImagePreview: (coverImagePreview) => set({ coverImagePreview }),
  removeCoverImage: () =>
    set((state) => ({
      coverImageFile: null,
      coverImagePreview: "",
      editForm: { ...state.editForm, cover_image: "" },
    })),

  // Modal actions
  viewPaymentProof: (imageUrl) =>
    set({
      selectedImage: imageUrl,
      showImageModal: true,
    }),

  closeImageModal: () =>
    set({
      showImageModal: false,
      selectedImage: "",
    }),

  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),

  // Computed values
  getStats: () => {
    const { session } = get();

    if (!session?.participants) {
      return {
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        totalRevenue: 0,
        fillRate: 0,
        remainingSlots: session?.slots_total || 0,
      };
    }

    const approvedCount = session.participants.filter(
      (p) => p.status === "approved"
    ).length;

    const pendingCount = session.participants.filter((p) =>
      ["pending", "awaiting_approval", "waiting_payment"].includes(p.status)
    ).length;

    const rejectedCount = session.participants.filter(
      (p) => p.status === "rejected"
    ).length;

    const totalRevenue = approvedCount * (session.price_per_slot || 0);
    const fillRate = session.slots_total
      ? Math.round((approvedCount / session.slots_total) * 100)
      : 0;
    const remainingSlots = (session.slots_total || 0) - approvedCount;

    return {
      approvedCount,
      pendingCount,
      rejectedCount,
      totalRevenue,
      fillRate,
      remainingSlots,
    };
  },
}));

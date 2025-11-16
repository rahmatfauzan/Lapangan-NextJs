import api from "@/lib/axios";
import { AxiosError } from "axios";

export interface CreateBookingData {
  field_id: number;
  booking_date: string; // Format: YYYY-MM-DD
  booked_slots: string[]; // Format: ["09:00", "10:00"]
  name_orders?: string; // Untuk guest
  phone_orders?: string; // Untuk guest
}

export interface BookingResponse {
  message: string;
  data: {
    booking: any;
    snap_token: string;
    invoice_number: string;
  };
}

export interface BookingStatusResponse {
  message: string;
  data: {
    booking_status: string;
    transaction_status: string;
    invoice_number: string;
    midtrans_status?: any;
  };
}

// Helper function untuk handle error
const handleApiError = (error: unknown, context: string) => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const errors = error.response?.data?.errors;

    console.error(`❌ [${context}] API Error:`, {
      status: statusCode,
      message,
      errors,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
    });

    // Throw error dengan format yang konsisten
    throw {
      status: statusCode,
      message,
      errors,
      originalError: error,
    };
  }

  // Error yang bukan dari Axios
  console.error(`❌ [${context}] Unexpected Error:`, error);
  throw {
    status: 500,
    message: "Terjadi kesalahan yang tidak terduga",
    originalError: error,
  };
};

export const bookingService = {
  /**
   * Create new booking
   */
  createBooking: async (data: CreateBookingData): Promise<BookingResponse> => {
    try {
      console.log("📤 Creating booking with data:", data);
      
      const response = await api.post("api/bookings", data);
      
      console.log("✅ Booking created successfully:", response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, "createBooking");
      throw error; // This won't be reached, but TypeScript needs it
    }
  },

  /**
   * Get booking by invoice number
   */
  getBookingByInvoice: async (invoiceNumber: string) => {
    try {
      console.log("📤 Fetching booking by invoice:", invoiceNumber);
      
      const response = await api.get(`/bookings/invoice/${invoiceNumber}`);
      
      console.log("✅ Booking fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, "getBookingByInvoice");
      throw error;
    }
  },

  /**
   * Check booking status
   */
  checkStatus: async (
    invoiceNumber: string
  ): Promise<BookingStatusResponse> => {
    try {
      console.log("📤 Checking booking status:", invoiceNumber);
      
      const response = await api.get(`/bookings/status/${invoiceNumber}`);
      
      console.log("✅ Status checked successfully:", response.data);
      return response.data;
    } catch (error) {
      handleApiError(error, "checkStatus");
      throw error;
    }
  },

  /**
   * Get user's bookings (requires authentication)
   */
  getMyBookings: async (page: number = 1) => {
    try {
      console.log("📤 Fetching user bookings, page:", page);
      
      const response = await api.get(`/bookings/my-bookings?page=${page}`);
      
      console.log("✅ User bookings fetched successfully:", {
        total: response.data.total,
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, "getMyBookings");
      throw error;
    }
  },
};
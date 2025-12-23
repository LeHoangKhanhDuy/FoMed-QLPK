export interface PharmacySummaryResponse {
  success: boolean;
  totalActiveMedicines: number;
  totalStockValue: number;
  lowStockItemsCount: number;
  expiringSoonCount: number;
  lowStockItems: LowStockMedicine[];
  expiringLots: Array<{
    lotId?: number;
    medicineName: string;
    lotNumber: string;
    expiryDate: string;
    quantity: number;
    daysUntilExpiry: number;
  }>;
}

export interface LowStockMedicine {
  medicineId: number;
  name: string;
  totalQuantity: number;
  unit: string;
}

export interface TopSellingMedicine {
  medicineId: number;
  medicineName: string;
  totalSold: number;
  totalRevenue: number;
  category?: string;
}

export interface PharmacySalesData {
  date: string;
  revenue: number;
  itemsSold: number;
}

export interface PharmacySalesResponse {
  success: boolean;
  from: string;
  to: string;
  totalRevenue: number;
  avgDailyRevenue: number;
  totalItemsSold: number;
  daily: PharmacySalesData[];
}

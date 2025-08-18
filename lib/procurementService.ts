import { supabaseBrowser } from './supabaseClient';

export interface ProcurementItem {
  id?: string;
  item_name: string;
  category: 'fixed-assets' | 'tools-equipment';
  image?: string;
  department_request_date: string;
  department_budget_date: string;
  requested_value: number;
  selection_method: 'tender' | 'quotation' | 'direct' | 'emergency';
  actual_payment_value?: number;
  notes?: string;
  status: 'draft' | 'requested' | 'approved' | 'rejected' | 'purchased' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  requested_by: string;
  approved_by?: string;
  purchase_date?: string;
  warranty_period?: number;
  supplier?: string;
  specifications?: string;
  quantity: number;
  unit: string;
  budget_year: number;
  created_at?: string;
  updated_at?: string;
}

export class ProcurementService {
  private static getSupabase() {
    return supabaseBrowser();
  }

  static async getAllItems(): Promise<ProcurementItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching procurement items:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getItemById(id: string): Promise<ProcurementItem | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching procurement item:', error);
      return null;
    }
    
    return data;
  }

  static async createItem(item: Omit<ProcurementItem, 'id' | 'created_at' | 'updated_at'>): Promise<ProcurementItem> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating procurement item:', error);
      throw error;
    }
    
    return data;
  }

  static async updateItem(id: string, item: Partial<ProcurementItem>): Promise<ProcurementItem> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating procurement item:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteItem(id: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('procurement_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting procurement item:', error);
      return false;
    }
    
    return true;
  }

  static async getItemsByStatus(status: string): Promise<ProcurementItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching procurement items by status:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getItemsByDepartment(department: string): Promise<ProcurementItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching procurement items by department:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getItemsByBudgetYear(year: number): Promise<ProcurementItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .eq('budget_year', year)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching procurement items by budget year:', error);
      throw error;
    }
    
    return data || [];
  }

  static async searchItems(query: string): Promise<ProcurementItem[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('*')
      .or(`item_name.ilike.%${query}%,department.ilike.%${query}%,supplier.ilike.%${query}%,specifications.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching procurement items:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalValue: number;
    totalActualValue: number;
  }> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('procurement_items')
      .select('status, category, requested_value, actual_payment_value');
    
    if (error) {
      console.error('Error fetching procurement statistics:', error);
      throw error;
    }
    
    const items = data || [];
    
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    let totalActualValue = 0;
    
    items.forEach((item: any) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      totalValue += item.requested_value || 0;
      totalActualValue += item.actual_payment_value || 0;
    });
    
    return {
      total: items.length,
      byStatus,
      byCategory,
      totalValue,
      totalActualValue
    };
  }
}

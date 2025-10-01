import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchAdminDashboard } from '@/api/admin/dashboard';

export interface AdminDashboardNotifications {
  [key: string]: number;
}

export interface AdminDashboardLeaveStatus {
  name: string;
  value: number;
}

export interface AdminDashboardWeeklyAttendance {
  date: string;
  hadir: number;
  izin: number;
}

export interface AdminDashboardRecentLeave {
  id: number;
  employee_name: string;
  department: string | null;
  type: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number;
  status: string;
  reason: string | null;
}

export interface AdminDashboardAttendanceBreakdown {
  hadir: number;
  telat: number;
  izin: number;
  sakit: number;
  alfa: number;
  [key: string]: number;
}

export interface AdminDashboardData {
  total_employees: number;
  shifts_today: number;
  attendance_percentage: number;
  total_payroll: number;
  leaves_pending: number;
  payroll_pending: number;
  pending_users: number;
  weekly_attendance: AdminDashboardWeeklyAttendance[];
  leave_status: AdminDashboardLeaveStatus[];
  recent_leaves: AdminDashboardRecentLeave[];
  attendance_breakdown: AdminDashboardAttendanceBreakdown;
  notifications: AdminDashboardNotifications;
}

interface AdminDashboardContextValue {
  data: AdminDashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(undefined);

const initialData: AdminDashboardData = {
  total_employees: 0,
  shifts_today: 0,
  attendance_percentage: 0,
  total_payroll: 0,
  leaves_pending: 0,
  payroll_pending: 0,
  pending_users: 0,
  weekly_attendance: [],
  leave_status: [],
  recent_leaves: [],
  attendance_breakdown: {
    hadir: 0,
    telat: 0,
    izin: 0,
    sakit: 0,
    alfa: 0,
  },
  notifications: {},
};

export const AdminDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef<boolean>(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchAdminDashboard();
      if (!isMountedRef.current) {
        return;
      }
      setData({ ...initialData, ...response });
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      const errorInstance = err instanceof Error ? err : new Error('Gagal memuat dashboard admin');
      setError(errorInstance);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void load();
    pollingRef.current = setInterval(() => {
      void load();
    }, 30000);

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [load]);

  const value = useMemo<AdminDashboardContextValue>(() => ({
    data,
    isLoading,
    error,
    refresh: load,
  }), [data, isLoading, error, load]);

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>;
};

export const useAdminDashboard = (): AdminDashboardContextValue => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error('useAdminDashboard harus digunakan di dalam AdminDashboardProvider');
  }
  return context;
};

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  startOfWeek, endOfWeek, addWeeks, subWeeks,
  startOfMonth, endOfMonth, addMonths, subMonths,
  eachDayOfInterval, eachWeekOfInterval,
  isSameDay, parseISO, format,
} from "date-fns";
import Holidays from "date-holidays";

const hd = new Holidays("ID");

/**
 * useCalendar — state dan logic untuk halaman kalender.
 *
 * Mengelola navigasi periode (minggu/bulan), fetching orders,
 * dan helper untuk menentukan hari libur nasional.
 *
 * @returns {object} State dan fungsi siap pakai
 */
export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, view]);

  async function loadOrders() {
    try {
      setLoading(true);
      let startDate, endDate;
      if (view === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }
      const params = `?date_from=${format(startDate, "yyyy-MM-dd")}&date_to=${format(endDate, "yyyy-MM-dd")}`;
      const res = await api.getOrders(params);
      if (res.success) setOrders(res.data);
    } catch {
      toast.error("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  }

  function previousPeriod() {
    setCurrentDate((d) => view === "week" ? subWeeks(d, 1) : subMonths(d, 1));
  }

  function nextPeriod() {
    setCurrentDate((d) => view === "week" ? addWeeks(d, 1) : addMonths(d, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getOrdersForDate(date) {
    return orders
      .filter((order) => isSameDay(parseISO(order.service_date), date))
      .sort((a, b) => a.service_start_time.localeCompare(b.service_start_time));
  }

  /** Mengembalikan nama hari libur nasional Indonesia, atau null jika bukan hari libur. */
  function isHoliday(date) {
    const holidays = hd.isHoliday(date);
    return holidays && holidays.length > 0 ? holidays[0].name : null;
  }

  function openOrderDetail(order) {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }

  const days = view === "week"
    ? eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      })
    : eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      });

  const weeks = view === "month"
    ? eachWeekOfInterval(
        { start: startOfMonth(currentDate), end: endOfMonth(currentDate) },
        { weekStartsOn: 1 },
      )
    : [];

  return {
    currentDate, view, setView,
    orders, loading,
    selectedOrder, showDetailModal, setShowDetailModal,
    days, weeks,
    previousPeriod, nextPeriod, goToToday,
    getOrdersForDate, isHoliday, openOrderDetail,
  };
}

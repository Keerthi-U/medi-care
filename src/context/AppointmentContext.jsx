import { createContext, useContext, useEffect, useState, useRef } from "react";

const API = "http://localhost:3001";
const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  const [appointments,  setAppointments]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const prevNotifCount = useRef(0);
  const [newNotif,      setNewNotif]      = useState(null); // for toast popup

  const fetchAppointments = async () => {
    try {
      const res  = await fetch(`${API}/appointments`);
      if (!res.ok) return;
      const data = await res.json();
      setAppointments(data);
    } catch (e) { /* server offline — silently skip */ }
  };

  const fetchNotifications = async () => {
    try {
      const res  = await fetch(`${API}/notifications`);
      if (!res.ok) return;
      const data = await res.json();

      // ── Auto-polling: detect new notifications ──
      if (data.length > prevNotifCount.current && prevNotifCount.current > 0) {
        const latest = data[data.length - 1];
        setNewNotif(latest);
        setTimeout(() => setNewNotif(null), 5000);
      }
      prevNotifCount.current = data.length;
      setNotifications(data);
    } catch (e) { console.error(e); }
  };

  // ── Poll every 10 seconds ─────────────────────────
  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchAppointments();
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const bookAppointment = async (data) => {
    try {
      const apptRes = await fetch(`${API}/appointments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id:        `APT${Date.now()}`,
          status:    "Pending",
          createdAt: new Date().toISOString(),
        }),
      });
      const appt = await apptRes.json();
      setAppointments((prev) => [...prev, appt]);

      await fetch(`${API}/notifications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:          `NTF${Date.now()}`,
          doctorId:    data.doctorId,
          doctorName:  data.doctorName,
          patientName: data.patientName,
          message:     `New appointment from ${data.patientName} on ${data.date} at ${data.time}`,
          date:        data.date,
          time:        data.time,
          read:        false,
          createdAt:   new Date().toISOString(),
        }),
      });

      await fetchNotifications();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Booking failed." };
    }
  };

  const markNotifRead = async (id) => {
    try {
      await fetch(`${API}/notifications/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) =>
        fetch(`${API}/notifications/${n.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      ));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API}/appointments/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setAppointments((prev) => prev.map((a) => a.id === id ? data : a));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppointmentContext.Provider value={{
      appointments, notifications, loading,
      unreadCount, newNotif,
      bookAppointment, markNotifRead, markAllRead,
      updateAppointmentStatus, fetchAppointments,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  return useContext(AppointmentContext);
}

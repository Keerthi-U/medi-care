import { createContext, useContext, useEffect, useState } from "react";

// ── Base URL for json-server ──────────────────────────
const API_URL = import.meta.env.VITE_API_URL;

// ── Create Context ────────────────────────────────────
const DoctorContext = createContext();

// ── Provider ──────────────────────────────────────────
export function DoctorProvider({ children }) {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── READ — fetch all doctors ──────────────────────
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      setError("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  // ── CREATE — add new doctor ───────────────────────
  const addDoctor = async (newDoctor) => {
    try {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newDoctor),
      });
      const data = await res.json();
      setDoctors((prev) => [...prev, data]);
    } catch (err) {
      setError("Failed to add doctor.");
    }
  };

  // ── UPDATE — edit existing doctor ─────────────────
  const updateDoctor = async (id, updatedDoctor) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedDoctor),
      });
      const data = await res.json();
      setDoctors((prev) =>
        prev.map((doc) => (doc.id === id ? data : doc))
      );
    } catch (err) {
      setError("Failed to update doctor.");
    }
  };

  // ── DELETE — remove doctor ────────────────────────
  const deleteDoctor = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError("Failed to delete doctor.");
    }
  };

  // ── Fetch on mount ────────────────────────────────
  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <DoctorContext.Provider
      value={{ doctors, loading, error, addDoctor, updateDoctor, deleteDoctor }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────
export function useDoctors() {
  return useContext(DoctorContext);
}

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const API = "import.meta.env.VITE_API_URL";

const ADMIN = {
  email:    "admin@medicare.com",
  password: "admin123",
  name:     "Dr. Anitha Sharma",
  role:     "Chief Medical Officer",
  initials: "AS",
  type:     "admin",
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ── Admin Login ───────────────────────────────────
  const loginAdmin = async (email, password) => {
    setLoading(true); setError("");
    await new Promise((r) => setTimeout(r, 700));
    if (email === ADMIN.email && password === ADMIN.password) {
      setUser({ ...ADMIN, type: "admin" });
      setLoading(false);
      return true;
    }
    setError("Invalid admin credentials.");
    setLoading(false);
    return false;
  };

  // ── Doctor Login ──────────────────────────────────
  // Doctor logs in with: email + medicalLicenseNumber as password
  const loginDoctor = async (email, password) => {
    setLoading(true); setError("");
    await new Promise((r) => setTimeout(r, 700));
    try {
      const res     = await fetch(`${API}/doctors?email=${email}`);
      const doctors = await res.json();
      const doctor  = doctors[0];

      if (doctor && doctor.medicalLicenseNumber === password) {
        setUser({
          id:          doctor.id,
          name:        doctor.name,
          email:       doctor.email,
          role:        doctor.designation,
          department:  doctor.department,
          initials:    doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
          profileImage:doctor.profileImage,
          type:        "doctor",
        });
        setLoading(false);
        return true;
      }
      setError("Invalid email or license number.");
      setLoading(false);
      return false;
    } catch (e) {
      setError("Login failed. Check if server is running.");
      setLoading(false);
      return false;
    }
  };

  const logout = () => { setUser(null); setError(""); };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginAdmin, loginDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

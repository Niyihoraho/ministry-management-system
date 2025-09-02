import ComponentCard from "@/app/components/common/ComponentCard";
import Label from "@/app/components/common/Label";
import Input from "@/app/components/input/InputField";
import Select from "@/app/components/common/Select";
import { useState } from "react";

interface UserFormProps {
  onSuccess: () => void;
}

export default function UserForm({ onSuccess }: UserFormProps) {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    confirmPassword: "",
    contact: "",
    status: "active"
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!form.email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      
      const data = await res.json();
      
      if (!data.ok) {
        if (data.errors) {
          // Handle field-specific errors
          const errorMessages = Object.values(data.errors).flat();
          setError(errorMessages.join(", "));
        } else {
          setError(data.message || "Failed to register user.");
        }
        return;
      }
      
      setMessage("User registered successfully!");
      setForm({ 
        name: "", 
        email: "", 
        password: "",
        confirmPassword: "",
        contact: "",
        status: "active"
      });
      
      // Call onSuccess after a short delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Failed to register user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Register New User">
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input 
            name="name" 
            type="text" 
            value={form.name} 
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange}
            placeholder="Enter password (min 6 characters)"
          />
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input 
            name="confirmPassword" 
            type="password" 
            value={form.confirmPassword} 
            onChange={handleChange}
            placeholder="Confirm password"
          />
        </div>
        
        
        <button 
          type="submit" 
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register User"}
        </button>
      </form>
    </ComponentCard>
  );
} 
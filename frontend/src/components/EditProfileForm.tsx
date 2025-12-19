import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface EditProfileFormProps {
  user: {
    fullName: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  onUpdate: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileForm({ user, onUpdate, onCancel }: EditProfileFormProps) {
  const { toast } = useToast();
  const initialAddress = user.address || {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  };
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: initialAddress,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.replace("address.", "");
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await onUpdate({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: {
          ...formData.address,
          country: formData.address.country || "India",
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onCancel();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          disabled={loading}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address.street">Street Address</Label>
        <Input
          id="address.street"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address.city">City</Label>
          <Input
            id="address.city"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.state">State</Label>
          <Input
            id="address.state"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address.postalCode">Postal Code</Label>
          <Input
            id="address.postalCode"
            name="address.postalCode"
            value={formData.address.postalCode}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address.country">Country</Label>
          <Input
            id="address.country"
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

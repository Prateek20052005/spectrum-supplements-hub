import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

type LocationState = {
  email?: string;
};

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = searchParams.get("token") || "";
  const emailFromQuery = searchParams.get("email") || "";
  const emailFromState = (location.state as LocationState | null)?.email || "";

  const [email, setEmail] = useState(emailFromQuery || emailFromState);
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">(
    token && (emailFromQuery || emailFromState) ? "verifying" : "idle"
  );
  const [message, setMessage] = useState<string>(
    token ? "Verifying your email..." : "Enter your email to resend the verification link."
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      if (!email) {
        setStatus("error");
        setMessage("Missing email.");
        return;
      }

      try {
        setStatus("verifying");
        const res = await fetch(
          `${API_BASE_URL}/api/users/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
            email
          )}`
        );
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to verify email");
        }

        setStatus("verified");
        setMessage(data?.message || "Email verified.");
        toast({
          title: "Email verified",
          description: "You can now log in.",
        });
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Failed to verify email.");
      }
    };

    run();
  }, [email, token, toast]);

  const handleResend = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please enter your email.",
      });
      return;
    }

    try {
      setResending(true);
      const res = await fetch(`${API_BASE_URL}/api/users/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to resend verification email");
      }

      toast({
        title: "Verification email sent",
        description: "Check your inbox (and spam folder).",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Could not resend",
        description: e?.message || "Failed to resend verification email.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-4 py-12 flex justify-center">
          <Card className="w-full max-w-md shadow-card bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">Verify your email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground text-center">{message}</p>

              {status !== "verified" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                {status === "verified" ? (
                  <Button className="w-full" onClick={() => navigate("/login")}>Log in</Button>
                ) : (
                  <Button className="w-full" onClick={handleResend} disabled={resending || status === "verifying"}>
                    {resending ? "Sending..." : "Resend verification email"}
                  </Button>
                )}

                <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                  Back to login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;

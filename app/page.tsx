"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Router uchun
import { login } from '@/lib/apiservice'

interface Feature {
  title: string;
  description: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

export default function LandingPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = { username, password };
      const data = await login(credentials);

      // Tokenlarni cookie da saqlash
      document.cookie = `access_token=${data.access}; path=/; max-age=3600`; // 1 soat
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=604800`; // 7 kun
      document.cookie = `user_id=${data.user_id}; path=/; max-age=604800`;

      // Dashboardga yo'naltirish
      router.push("/dashboard");
    } catch (err) {
      setError((err as { message?: string }).message || "Login yoki parol xato!");
    } finally {
      setLoading(false);
      router.push('/dashboard')
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
   
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-full max-w-sm space-y-4">
                <form onSubmit={handleLogin} className="space-y-4 mb-5">
                  {error && <p className="text-red-500">{error}</p>}
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full " disabled={loading}>
                    {loading ? "Loading..." : "Login"}
                  </Button>
                </form>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full ">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Qolgan qismlar o'zgarmagan holda qoldiriladi */}
      </main>
      {/* Footer o'zgarmagan holda qoldiriladi */}
    </div>
  );
}

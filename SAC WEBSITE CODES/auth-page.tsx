import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Fan, Users, ShoppingCart, IndianRupee, Gift, Star, Share2 } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Extract referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setRegisterData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Fan className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sufi Air Condition</h1>
                <p className="text-blue-100 text-sm">Premium Cooling Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Refer Friends,
                <span className="gradient-text"> Earn Rewards</span>
              </h2>
              <p className="text-xl text-gray-600">
                Join our referral program and earn ₹400 for every successful referral. 
                Share the comfort of premium air conditioning solutions with your network.
              </p>
            </div>

            <div className="inline-flex items-center bg-green-50 px-6 py-3 rounded-full border border-green-200">
              <Gift className="text-green-600 w-5 h-5 mr-2" />
              <span className="text-green-800 font-semibold">₹400 per successful referral</span>
            </div>

            {/* How it Works */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">How it Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <Share2 className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Share Your Link</h4>
                    <p className="text-gray-600">Get your unique referral link and share it with friends</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Friend Purchases</h4>
                    <p className="text-gray-600">Your referral makes a purchase from our premium products</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Earn ₹400</h4>
                    <p className="text-gray-600">Receive your reward directly in your bank account</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="gradient-bg rounded-2xl p-6 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">2,500+</div>
                  <p className="text-blue-100 text-sm">Active Referrers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">₹12,50,000</div>
                  <p className="text-blue-100 text-sm">Total Paid Out</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">8,400+</div>
                  <p className="text-blue-100 text-sm">Successful Referrals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-2xl font-bold">4.9</span>
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-blue-100 text-sm">Program Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="register" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="register">Register</TabsTrigger>
                    <TabsTrigger value="login">Login</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="register" className="space-y-4">
                    {registerData.referralCode && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          Using referral code: <Badge variant="secondary">{registerData.referralCode}</Badge>
                        </p>
                      </div>
                    )}
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                        <Input
                          id="referralCode"
                          value={registerData.referralCode}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, referralCode: e.target.value }))}
                          placeholder="Enter referral code if you have one"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gradient-bg"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant={!isAdmin ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsAdmin(false)}
                          className={!isAdmin ? "gradient-bg" : ""}
                        >
                          User Login
                        </Button>
                        <Button
                          type="button"
                          variant={isAdmin ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsAdmin(true)}
                          className={isAdmin ? "gradient-bg" : ""}
                        >
                          Admin Login
                        </Button>
                      </div>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="loginEmail">Email Address</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="loginPassword">Password</Label>
                        <Input
                          id="loginPassword"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gradient-bg"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

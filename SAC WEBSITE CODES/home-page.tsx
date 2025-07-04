import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  Share2, 
  Copy,
  University,
  TrendingUp,
  User,
  LogOut,
  Settings
} from "lucide-react";

interface UserStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
}

interface Referral {
  id: number;
  referredEmail: string;
  referredName: string;
  status: string;
  rewardAmount: string;
  createdAt: string;
}

interface BankDetails {
  id?: number;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Fetch user stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user-stats"],
    enabled: !!user,
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  // Fetch bank details
  const { data: existingBankDetails } = useQuery<BankDetails>({
    queryKey: ["/api/bank-details"],
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setBankDetails(data);
      }
    },
  });

  // Bank details mutation
  const bankDetailsMutation = useMutation({
    mutationFn: async (data: BankDetails) => {
      const method = existingBankDetails ? "PUT" : "POST";
      const res = await apiRequest(method, "/api/bank-details", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-details"] });
      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBankDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bankDetailsMutation.mutate(bankDetails);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const copyReferralLink = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}/auth?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const shareToWhatsApp = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}/auth?ref=${user.referralCode}`;
      const message = `Hey! Join Sufi Air Condition's referral program and get premium cooling solutions. Use my referral link: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mr-3">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "dashboard" ? "active" : "text-gray-700"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("referrals")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "referrals" ? "active" : "text-gray-700"
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    My Referrals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("bank-details")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "bank-details" ? "active" : "text-gray-700"
                    }`}
                  >
                    <University className="w-5 h-5 mr-3" />
                    Bank Details
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "profile" ? "active" : "text-gray-700"
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Profile
                  </button>
                </li>
                <li className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "dashboard" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Track your referrals and earnings</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1 stats-counter">
                          {stats?.totalReferrals || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Users className="text-blue-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Successful</p>
                        <p className="text-3xl font-bold text-green-600 mt-1 stats-counter">
                          {stats?.successfulReferrals || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-green-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                        <p className="text-3xl font-bold text-green-600 mt-1 stats-counter">
                          ₹{stats?.totalEarnings || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <IndianRupee className="text-green-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-amber-600 mt-1 stats-counter">
                          {stats?.pendingReferrals || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Clock className="text-amber-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Link Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Input
                      value={`${window.location.origin}/auth?ref=${user.referralCode}`}
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button onClick={copyReferralLink} className="gradient-bg">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={shareToWhatsApp} className="bg-green-500 hover:bg-green-600">
                      <Share2 className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Share2 className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-50">
                      <Share2 className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                      <Share2 className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No referrals yet. Start sharing your link!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.slice(0, 5).map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <User className="text-blue-600 w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{referral.referredName}</p>
                              <p className="text-sm text-gray-500">{referral.referredEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(referral.status)}
                            <p className="text-sm text-gray-500 mt-1">{formatDate(referral.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Referrals</h1>
                <p className="text-gray-600">View all your referrals and their status</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  {referrals.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No referrals yet</h3>
                      <p className="text-gray-500 mb-6">Start sharing your referral link to earn rewards!</p>
                      <Button onClick={() => setActiveTab("dashboard")} className="gradient-bg">
                        Get Your Referral Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <User className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{referral.referredName}</h4>
                              <p className="text-sm text-gray-500">{referral.referredEmail}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(referral.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(referral.status)}
                            <p className="text-sm font-medium text-gray-900 mt-1">₹{referral.rewardAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "bank-details" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Details</h1>
                <p className="text-gray-600">Manage your bank account for reward payments</p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <form onSubmit={handleBankDetailsSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          value={bankDetails.accountHolderName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                          placeholder="Enter account holder name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Enter bank name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Enter account number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={bankDetails.ifscCode}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                          placeholder="Enter IFSC code"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-8">
                      <Button 
                        type="submit" 
                        className="gradient-bg"
                        disabled={bankDetailsMutation.isPending}
                      >
                        {bankDetailsMutation.isPending ? "Saving..." : "Save Bank Details"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" value={user.email} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={user.phone || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="referralCode">Your Referral Code</Label>
                      <Input id="referralCode" value={user.referralCode} readOnly />
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm text-gray-500">
                      Profile information is currently read-only. Contact support to make changes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

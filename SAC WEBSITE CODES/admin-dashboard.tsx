import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  TrendingUp,
  Shield,
  LogOut,
  UserCheck,
  Handshake,
  CreditCard,
  BarChart3
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeReferrers: number;
  totalPayouts: number;
  pendingReviews: number;
}

interface AdminReferral {
  id: number;
  referrerId: number;
  referredEmail: string;
  referredName: string;
  status: string;
  rewardAmount: string;
  createdAt: string;
  referrer?: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all referrals for admin
  const { data: referrals = [] } = useQuery<AdminReferral[]>({
    queryKey: ["/api/admin/referrals"],
    enabled: !!user?.isAdmin,
  });

  // Update referral status mutation
  const updateReferralMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/referrals/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Referral status updated successfully",
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateReferralMutation.mutate({ id, status });
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
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Cancelled
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mr-3">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Admin Panel</h4>
                <p className="text-sm text-gray-500">Referral Management</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "overview" ? "active" : "text-gray-700"
                    }`}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "users" ? "active" : "text-gray-700"
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Users
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("referrals")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "referrals" ? "active" : "text-gray-700"
                    }`}
                  >
                    <Handshake className="w-5 h-5 mr-3" />
                    Referrals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("payouts")}
                    className={`sidebar-item w-full flex items-center px-4 py-3 rounded-lg font-medium text-left ${
                      activeTab === "payouts" ? "active" : "text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    Payouts
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

        {/* Admin Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage referral program and users</p>
              </div>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1 stats-counter">
                          {stats?.totalUsers || 0}
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
                        <p className="text-gray-600 text-sm font-medium">Active Referrers</p>
                        <p className="text-3xl font-bold text-green-600 mt-1 stats-counter">
                          {stats?.activeReferrers || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <UserCheck className="text-green-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Payouts</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1 stats-counter">
                          ₹{stats?.totalPayouts || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <IndianRupee className="text-purple-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                        <p className="text-3xl font-bold text-amber-600 mt-1 stats-counter">
                          {stats?.pendingReviews || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Clock className="text-amber-600 w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-8">
                      <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No referrals found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.slice(0, 5).map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <Users className="text-blue-600 w-5 h-5" />
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Referrals Management</h1>
                <p className="text-gray-600">Review and manage all referrals</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  {referrals.length === 0 ? (
                    <div className="text-center py-12">
                      <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No referrals yet</h3>
                      <p className="text-gray-500">Referrals will appear here once users start referring others.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referrer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referred User
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {referrals.map((referral) => (
                            <tr key={referral.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <Users className="text-blue-600 w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    Referrer #{referral.referrerId}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{referral.referredName}</p>
                                  <p className="text-sm text-gray-500">{referral.referredEmail}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(referral.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{referral.rewardAmount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(referral.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {referral.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(referral.id, 'completed')}
                                        disabled={updateReferralMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(referral.id, 'cancelled')}
                                        disabled={updateReferralMutation.isPending}
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {referral.status !== 'pending' && (
                                    <span className="text-gray-400">No actions</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
                <p className="text-gray-600">View and manage all registered users</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500">User management features will be implemented here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts Management</h1>
                <p className="text-gray-600">Manage and process payouts to users</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payout Management</h3>
                    <p className="text-gray-500">Payout management features will be implemented here.</p>
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

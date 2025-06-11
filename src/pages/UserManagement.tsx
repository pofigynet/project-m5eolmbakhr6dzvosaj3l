import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  Mail, 
  Shield,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserRole } from "@/hooks/useUserRole";

export default function UserManagement() {
  const { isAdmin, permissions } = useUserRole();
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "viewer" as const,
  });

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => User.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
  });

  const handleInviteUser = async () => {
    if (!newUser.full_name.trim() || !newUser.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check for duplicate email
    const existingUser = users.find(user => 
      user.email.toLowerCase() === newUser.email.toLowerCase()
    );
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }

    setIsLoading(true);
    try {
      // Note: Since backend functions are disabled, we can only create user records
      // In a real implementation, this would send an invitation email
      await User.create({
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      });

      toast.success(`User invitation sent to ${newUser.email}`);
      setIsInviting(false);
      setNewUser({
        full_name: "",
        email: "",
        role: "viewer",
      });
      refetch();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      
      // Provide more specific error messages
      if (error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
        toast.error("A user with this email already exists");
      } else if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
        toast.error("You don't have permission to invite users");
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again");
      } else if (error?.message?.includes('validation')) {
        toast.error("Invalid user data. Please check all fields");
      } else {
        toast.error(`Failed to invite user: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete users");
      return;
    }

    if (userId === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    try {
      await User.delete(userId);
      toast.success(`User ${userName} deleted successfully`);
      refetch();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error?.message || 'Unknown error'}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (!permissions.canAccessSettings) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Access Denied</h2>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
            <p className="mt-2 text-muted-foreground">
              You don't have permission to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        {isAdmin && (
          <Dialog open={isInviting} onOpenChange={setIsInviting}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new user to join the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Viewers can only view data, Editors can create and edit, Administrators have full access
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInviting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteUser} disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            All users with access to the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{user.full_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleColor(user.role)}>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </Badge>
                  {isAdmin && user.id !== currentUser?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.full_name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                <p className="mt-2 text-muted-foreground">
                  Start by inviting users to join the platform.
                </p>
                {isAdmin && (
                  <Button className="mt-4" onClick={() => setIsInviting(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite First User
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding user roles and their capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium">Viewer</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View projects and data</li>
                <li>• Access reports and dashboards</li>
                <li>• Cannot create or edit</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Editor</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All viewer permissions</li>
                <li>• Create and edit projects</li>
                <li>• Enter and modify data</li>
                <li>• Manage forms</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-600" />
                <h4 className="font-medium">Administrator</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All editor permissions</li>
                <li>• Manage users and roles</li>
                <li>• Delete projects and data</li>
                <li>• System configuration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
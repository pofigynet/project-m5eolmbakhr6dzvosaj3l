import { SidebarTrigger } from "@/components/ui/sidebar";

export default function UserManagement() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">User management features coming soon...</p>
      </div>
    </div>
  );
}
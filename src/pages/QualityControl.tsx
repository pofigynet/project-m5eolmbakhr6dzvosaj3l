import { SidebarTrigger } from "@/components/ui/sidebar";

export default function QualityControl() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
      </div>
      
      <div className="text-center py-12">
        <p>Quality control interface coming soon...</p>
      </div>
    </div>
  );
}
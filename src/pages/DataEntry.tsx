import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function DataEntry() {
  const { id } = useParams();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/projects/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Data Entry</h2>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">Data entry interface coming soon...</p>
      </div>
    </div>
  );
}
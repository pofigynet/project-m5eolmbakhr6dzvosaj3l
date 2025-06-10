import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function FormBuilderStandalone() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Form Builder</h2>
        </div>
        <Button asChild>
          <Link to="/form-builder/new">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>
      </div>

      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first form template to get started
        </p>
        <Button asChild>
          <Link to="/form-builder/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>
    </div>
  );
}
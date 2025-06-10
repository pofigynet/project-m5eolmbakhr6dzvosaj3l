import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function DataEntry() {
  const { id } = useParams();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/projects/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Data Entry</h1>
        <p className="text-muted-foreground">
          Enter and manage data records for this project
        </p>
      </div>

      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No forms available</h3>
        <p className="text-muted-foreground mb-4">
          Create forms first to start entering data
        </p>
        <Button asChild>
          <Link to={`/projects/${id}/forms/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>
    </div>
  );
}
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function FormBuilderNew() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/form-builder">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forms
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Form
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create New Form</h1>
        <p className="text-muted-foreground">
          Design your data collection form with drag-and-drop fields
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Builder</CardTitle>
          <CardDescription>
            Drag and drop form elements to create your data collection form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Form builder interface will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
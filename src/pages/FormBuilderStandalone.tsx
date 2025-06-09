import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, FileText, Edit, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, Project } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export default function FormBuilderStandalone() {
  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: () => Form.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  // Create a map of project names for quick lookup
  const projectMap = projects.reduce((acc, project) => {
    acc[project.id] = project.project_name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Form Builder</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/form-builder/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Form
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Form Management</CardTitle>
            <CardDescription>
              Create and manage data collection forms for your research projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Create New Form Card */}
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Create New Form</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build a new data collection form with our drag-and-drop builder
                  </p>
                  <Button asChild>
                    <Link to="/form-builder/new">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Forms */}
              {forms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{form.form_name}</CardTitle>
                        <CardDescription className="text-sm">
                          Project: {projectMap[form.project_id] || 'Unknown Project'}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        form.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {form.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Fields: {form.schema?.fields?.length || 0}</span>
                      <span>Order: {form.order_index}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${form.project_id}/forms/${form.id}/edit`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {forms.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first data collection form to get started
                </p>
                <Button asChild>
                  <Link to="/form-builder/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Form
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Builder Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drag & Drop Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easily create forms with our intuitive drag-and-drop interface. Add text fields, dropdowns, checkboxes, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See how your form will look as you build it. Test field validation and user experience in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up complex validation rules, required fields, and data formats to ensure data quality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
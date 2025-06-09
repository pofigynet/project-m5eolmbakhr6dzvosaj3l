import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, FileText, FormInput, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Project, Form } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export default function FormBuilderStandalone() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: () => Form.list(),
  });

  const recentForms = forms
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

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
        <p className="text-muted-foreground">
          Design and build custom data collection forms for your research projects.
        </p>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link to="/form-builder/new">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Create New Form</CardTitle>
                </div>
                <CardDescription>
                  Start building a new data collection form from scratch
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FormInput className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Form Templates</CardTitle>
              </div>
              <CardDescription>
                Use pre-built templates for common research scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Form Generator</CardTitle>
              </div>
              <CardDescription>
                Generate forms automatically using AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>
              Forms you've worked on recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentForms.map((form) => {
                const project = projects.find(p => p.id === form.project_id);
                return (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-1">
                      <h4 className="font-medium">{form.form_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Project: {project?.project_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last modified: {new Date(form.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${form.project_id}/forms/${form.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                );
              })}
              {recentForms.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No forms yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    Create your first form to get started with data collection.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/form-builder/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Form
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Select a project to create forms for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const projectForms = forms.filter(f => f.project_id === project.id);
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{project.project_name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Forms:</span>
                          <span>{projectForms.length}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/projects/${project.id}/forms/new`}>
                            Add Form
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {projects.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    No projects available. Create a project first to build forms.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/projects">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
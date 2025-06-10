import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Search, FileText, Edit, Eye, Trash2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, Project } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Forms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: () => Form.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.form_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || form.project_id === selectedProject;
    return matchesSearch && matchesProject;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.project_name || 'Unknown Project';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Forms</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/forms/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {form.form_name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/${form.project_id}/forms/${form.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Form
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/${form.project_id}/data-entry`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Data Entry
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Project: {getProjectName(form.project_id)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Order: {form.order_index}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge variant={form.is_active ? "default" : "secondary"}>
                  {form.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/projects/${form.project_id}/forms/${form.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No forms found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedProject !== "all" 
              ? "Try adjusting your search terms or filters." 
              : "Get started by creating your first form."}
          </p>
          {!searchTerm && selectedProject === "all" && (
            <Button className="mt-4" asChild>
              <Link to="/forms/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
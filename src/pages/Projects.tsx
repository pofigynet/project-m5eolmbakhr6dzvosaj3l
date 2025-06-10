import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, FolderOpen, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Project } from "@/entities/Project";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    principal_investigator: "",
    institution: "",
    irb_number: "",
    status: "development" as const,
  });

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        console.log('Fetching projects...');
        const result = await Project.list();
        console.log('Projects fetched successfully:', result);
        return result || [];
      } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
    },
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.project_name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating project with data:', newProject);
      
      // Create the project
      const createdProject = await Project.create({
        project_name: newProject.project_name,
        description: newProject.description,
        principal_investigator: newProject.principal_investigator,
        institution: newProject.institution,
        irb_number: newProject.irb_number,
        status: newProject.status,
        settings: {}
      });
      
      console.log('Project created successfully:', createdProject);
      
      toast.success("Project created successfully!");
      
      // Reset form
      setNewProject({
        project_name: "",
        description: "",
        principal_investigator: "",
        institution: "",
        irb_number: "",
        status: "development",
      });
      
      // Close dialog
      setIsCreateDialogOpen(false);
      
      // Refetch projects
      await refetch();
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new research project to organize your data collection forms and records.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={newProject.project_name}
                  onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="principal_investigator">Principal Investigator</Label>
                <Input
                  id="principal_investigator"
                  value={newProject.principal_investigator}
                  onChange={(e) => setNewProject({ ...newProject, principal_investigator: e.target.value })}
                  placeholder="Enter PI name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={newProject.institution}
                  onChange={(e) => setNewProject({ ...newProject, institution: e.target.value })}
                  placeholder="Enter institution name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irb_number">IRB Number</Label>
                <Input
                  id="irb_number"
                  value={newProject.irb_number}
                  onChange={(e) => setNewProject({ ...newProject, irb_number: e.target.value })}
                  placeholder="Enter IRB approval number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newProject.status} onValueChange={(value: any) => setNewProject({ ...newProject, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your research project"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.project_name}</CardTitle>
                    <CardDescription>
                      {project.principal_investigator && `PI: ${project.principal_investigator}`}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'production' ? 'bg-green-100 text-green-800' :
                    project.status === 'development' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                {project.institution && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Institution: {project.institution}
                  </p>
                )}
                
                {project.irb_number && (
                  <p className="text-xs text-muted-foreground mb-4">
                    IRB: {project.irb_number}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      0 Forms
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      0 Records
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/projects/${project.id}`}> 
                      View Project
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first research project to get started with data collection
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

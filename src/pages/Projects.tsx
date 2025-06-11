import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search,
  Database,
  Users,
  Building,
  Shield,
  Calendar,
  Trash2
} from "lucide-react";
import { Project, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisitType {
  id: string;
  name: string;
  order: number;
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    principal_investigator: "",
    institution: "",
    irb_number: "",
    status: "development" as const,
    number_of_visits: 1,
  });
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([
    { id: "baseline", name: "Baseline", order: 1 }
  ]);

  const { data: projects = [], refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
  });

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNumberOfVisitsChange = (value: number) => {
    setNewProject({ ...newProject, number_of_visits: value });
    
    // Auto-generate visit types based on number of visits
    const newVisitTypes: VisitType[] = [];
    for (let i = 1; i <= value; i++) {
      if (i === 1) {
        newVisitTypes.push({ id: "baseline", name: "Baseline", order: 1 });
      } else {
        const monthNumber = i - 1;
        newVisitTypes.push({ 
          id: `month_${monthNumber}`, 
          name: `${monthNumber}M`, 
          order: i 
        });
      }
    }
    setVisitTypes(newVisitTypes);
  };

  const updateVisitType = (index: number, name: string) => {
    const updated = [...visitTypes];
    updated[index] = { ...updated[index], name, id: name.toLowerCase().replace(/\s+/g, '_') };
    setVisitTypes(updated);
  };

  const removeVisitType = (index: number) => {
    if (visitTypes.length > 1) {
      const updated = visitTypes.filter((_, i) => i !== index);
      // Reorder the remaining visits
      const reordered = updated.map((visit, i) => ({ ...visit, order: i + 1 }));
      setVisitTypes(reordered);
      setNewProject({ ...newProject, number_of_visits: reordered.length });
    }
  };

  const addVisitType = () => {
    const newOrder = visitTypes.length + 1;
    const newVisit: VisitType = {
      id: `visit_${newOrder}`,
      name: `Visit ${newOrder}`,
      order: newOrder
    };
    setVisitTypes([...visitTypes, newVisit]);
    setNewProject({ ...newProject, number_of_visits: newOrder });
  };

  const handleCreateProject = async () => {
    if (!newProject.project_name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (visitTypes.length === 0) {
      toast.error("At least one visit type is required");
      return;
    }

    try {
      await Project.create({
        ...newProject,
        owner_id: currentUser?.id || '',
        visit_types: visitTypes,
        settings: {
          data_validation: true,
          audit_logging: true,
          user_access_control: false,
          auto_backup: true,
        },
      });

      toast.success("Project created successfully!");
      setIsCreating(false);
      setNewProject({
        project_name: "",
        description: "",
        principal_investigator: "",
        institution: "",
        irb_number: "",
        status: "development",
        number_of_visits: 1,
      });
      setVisitTypes([{ id: "baseline", name: "Baseline", order: 1 }]);
      refetch();
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-yellow-100 text-yellow-800';
      case 'analysis':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">
              Manage your research projects and data collection
            </p>
          </div>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new research project with visit schedule and data collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Project Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_name">Project Name *</Label>
                    <Input
                      id="project_name"
                      value={newProject.project_name}
                      onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newProject.status} 
                      onValueChange={(value: any) => setNewProject({ ...newProject, status: value })}
                    >
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal_investigator">Principal Investigator</Label>
                    <Input
                      id="principal_investigator"
                      value={newProject.principal_investigator}
                      onChange={(e) => setNewProject({ ...newProject, principal_investigator: e.target.value })}
                      placeholder="PI name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={newProject.institution}
                      onChange={(e) => setNewProject({ ...newProject, institution: e.target.value })}
                      placeholder="Institution name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="irb_number">IRB Number (Optional)</Label>
                  <Input
                    id="irb_number"
                    value={newProject.irb_number}
                    onChange={(e) => setNewProject({ ...newProject, irb_number: e.target.value })}
                    placeholder="IRB approval number"
                  />
                </div>
              </div>

              {/* Visit Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visit Schedule</h3>
                <div className="space-y-2">
                  <Label htmlFor="number_of_visits">Number of Visits</Label>
                  <Input
                    id="number_of_visits"
                    type="number"
                    min="1"
                    max="20"
                    value={newProject.number_of_visits}
                    onChange={(e) => handleNumberOfVisitsChange(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Visit Types</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVisitType}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Visit
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {visitTypes.map((visit, index) => (
                      <div key={visit.id} className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground w-8">{visit.order}.</span>
                        <Input
                          value={visit.name}
                          onChange={(e) => updateVisitType(index, e.target.value)}
                          placeholder="Visit name"
                          className="flex-1"
                        />
                        {visitTypes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVisitType(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.project_name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{project.principal_investigator}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{project.institution}</span>
                </div>
                {project.irb_number && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>IRB: {project.irb_number}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{project.number_of_visits || 1} visits</span>
                </div>
                <div className="pt-2">
                  <Button className="w-full" asChild>
                    <Link to={`/projects/${project.id}`}>
                      <Database className="mr-2 h-4 w-4" />
                      View Project
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first research project to get started'
              }
            </p>
            {!searchTerm && (
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
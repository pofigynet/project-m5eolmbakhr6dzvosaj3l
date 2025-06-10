import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Download, Filter } from "lucide-react";
import { Project, Form, Record } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParticipantData {
  pid: string;
  projectId: string;
  forms: {
    [formId: string]: 'complete' | 'incomplete' | 'unverified';
  };
}

export default function ProjectsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: () => Form.list(),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['records'],
    queryFn: () => Record.list(),
  });

  // Generate participant data
  const generateParticipantData = (): ParticipantData[] => {
    const participantMap = new Map<string, ParticipantData>();

    records.forEach(record => {
      const key = `${record.project_id}-${record.record_id}`;
      if (!participantMap.has(key)) {
        participantMap.set(key, {
          pid: record.record_id,
          projectId: record.project_id,
          forms: {}
        });
      }

      const participant = participantMap.get(key)!;
      let status: 'complete' | 'incomplete' | 'unverified' = 'incomplete';
      
      if (record.validation_status === 'valid') {
        status = 'complete';
      } else if (record.validation_status === 'pending') {
        status = 'unverified';
      }

      participant.forms[record.form_id] = status;
    });

    return Array.from(participantMap.values());
  };

  const participantData = generateParticipantData();

  const filteredData = participantData.filter(participant => {
    const matchesSearch = participant.pid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !selectedProject || participant.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const getProjectForms = (projectId: string) => {
    return forms.filter(form => form.project_id === projectId).sort((a, b) => a.order_index - b.order_index);
  };

  const getStatusColor = (status: 'complete' | 'incomplete' | 'unverified' | undefined) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'incomplete':
        return 'bg-red-500';
      case 'unverified':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: 'complete' | 'incomplete' | 'unverified' | undefined) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'Incomplete';
      case 'unverified':
        return 'Unverified';
      default:
        return 'Not Started';
    }
  };

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const projectForms = selectedProjectData ? getProjectForms(selectedProject) : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Projects Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select project to view" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Incomplete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Unverified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span className="text-sm">Not Started</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Data Table */}
      {selectedProjectData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedProjectData.project_name}</CardTitle>
            <CardDescription>
              Participant completion status across all forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">PID</th>
                    {projectForms.map((form) => (
                      <th key={form.id} className="text-center p-3 font-medium min-w-[120px]">
                        <div className="space-y-1">
                          <div className="text-sm">{form.form_name}</div>
                          <div className="text-xs text-muted-foreground">Form {form.order_index}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData
                    .filter(participant => participant.projectId === selectedProject)
                    .map((participant) => (
                    <tr key={`${participant.projectId}-${participant.pid}`} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{participant.pid}</td>
                      {projectForms.map((form) => {
                        const status = participant.forms[form.id];
                        return (
                          <td key={form.id} className="p-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div 
                                className={`w-6 h-6 rounded-full ${getStatusColor(status)} cursor-pointer hover:scale-110 transition-transform`}
                                title={getStatusLabel(status)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {getStatusLabel(status)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.filter(p => p.projectId === selectedProject).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No participants found for this project</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedProject && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project from the dropdown above to view participant completion status
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

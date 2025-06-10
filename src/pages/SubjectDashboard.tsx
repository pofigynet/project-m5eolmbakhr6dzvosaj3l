import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  Plus, 
  Edit,
  FileText, 
  Calendar,
  User,
  Save,
  Trash2
} from "lucide-react";
import { Project, Form, Record } from "@/entities";
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

interface VisitType {
  id: string;
  name: string;
  order: number;
}

const defaultVisitTypes: VisitType[] = [
  { id: 'baseline', name: 'Baseline', order: 1 },
  { id: 'month1', name: 'Month 1', order: 2 },
  { id: 'month2', name: 'Month 2', order: 3 },
  { id: 'month3', name: 'Month 3', order: 4 },
  { id: 'month6', name: 'Month 6', order: 5 },
  { id: 'month12', name: 'Month 12', order: 6 },
];

export default function SubjectDashboard() {
  const { projectId, subjectId } = useParams<{ projectId: string; subjectId: string }>();
  const [visitTypes, setVisitTypes] = useState<VisitType[]>(defaultVisitTypes);
  const [newVisitName, setNewVisitName] = useState("");
  const [isAddingVisit, setIsAddingVisit] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => Project.get(projectId!),
    enabled: !!projectId,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms', projectId],
    queryFn: () => Form.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['records', projectId, subjectId],
    queryFn: () => Record.filter({ project_id: projectId, record_id: subjectId }),
    enabled: !!projectId && !!subjectId,
  });

  const getFormStatus = (formId: string, visitId: string) => {
    const record = records.find(r => 
      r.form_id === formId && 
      r.data?.visit_type === visitId
    );
    
    if (!record) return 'not_started';
    
    switch (record.validation_status) {
      case 'valid':
        return 'complete';
      case 'invalid':
        return 'incomplete';
      default:
        return 'unverified';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'incomplete':
        return 'bg-red-500';
      case 'unverified':
        return 'bg-yellow-500';
      case 'not_started':
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'Incomplete';
      case 'unverified':
        return 'Unverified';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };

  const addVisitType = () => {
    if (!newVisitName.trim()) {
      toast.error("Visit name is required");
      return;
    }

    const newVisit: VisitType = {
      id: `visit_${Date.now()}`,
      name: newVisitName,
      order: visitTypes.length + 1,
    };

    setVisitTypes([...visitTypes, newVisit]);
    setNewVisitName("");
    setIsAddingVisit(false);
    toast.success("Visit type added successfully");
  };

  const removeVisitType = (visitId: string) => {
    setVisitTypes(visitTypes.filter(v => v.id !== visitId));
    toast.success("Visit type removed");
  };

  const handleFormClick = (formId: string, visitId: string) => {
    // Navigate to data entry with pre-filled visit type
    const form = forms.find(f => f.id === formId);
    const visit = visitTypes.find(v => v.id === visitId);
    
    if (form && visit) {
      // You can implement navigation to data entry with pre-filled data
      toast.info(`Opening ${form.form_name} for ${visit.name}`);
    }
  };

  if (!project) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddingVisit} onOpenChange={setIsAddingVisit}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Visit Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Visit Type</DialogTitle>
                <DialogDescription>
                  Add a new visit type for data collection timepoints
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visit-name">Visit Name</Label>
                  <Input
                    id="visit-name"
                    value={newVisitName}
                    onChange={(e) => setNewVisitName(e.target.value)}
                    placeholder="e.g., Month 18, Follow-up"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingVisit(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addVisitType}>
                    <Save className="mr-2 h-4 w-4" />
                    Add Visit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subject Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <User className="mr-3 h-8 w-8" />
            Subject {subjectId}
          </h1>
          <p className="text-muted-foreground mt-2">
            Project: {project.project_name}
          </p>
        </div>
      </div>

      {/* Subject Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Form Completion by Visit</CardTitle>
          <CardDescription>
            Track form completion across different visit timepoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forms.length > 0 && visitTypes.length > 0 ? (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center space-x-6 p-4 bg-muted/50 rounded-lg">
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

              {/* Header Row */}
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid gap-2 p-4 bg-muted/30 rounded-lg font-medium" style={{gridTemplateColumns: `200px repeat(${visitTypes.length}, 120px)`}}>
                    <div>Form</div>
                    {visitTypes.map((visit) => (
                      <div key={visit.id} className="text-center flex items-center justify-center space-x-1">
                        <span className="text-xs">{visit.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => removeVisitType(visit.id)}
                          title="Remove visit type"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Form Rows */}
                  <div className="space-y-2 mt-2">
                    {forms.map((form) => (
                      <div key={form.id} className="grid gap-2 p-4 border rounded-lg hover:bg-muted/20" style={{gridTemplateColumns: `200px repeat(${visitTypes.length}, 120px)`}}>
                        <div className="font-medium truncate" title={form.form_name}>
                          {form.form_name}
                        </div>
                        {visitTypes.map((visit) => {
                          const status = getFormStatus(form.id, visit.id);
                          return (
                            <div key={visit.id} className="flex justify-center">
                              <button
                                className={`w-6 h-6 rounded-full ${getStatusColor(status)} cursor-pointer hover:scale-110 transition-transform`}
                                title={`${form.form_name} - ${visit.name}: ${getStatusLabel(status)}`}
                                onClick={() => handleFormClick(form.id, visit.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No forms or visits configured</h3>
              <p className="mt-2 text-muted-foreground">
                Create forms and visit types to track subject progress.
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button asChild>
                  <Link to="/form-builder">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Forms
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setIsAddingVisit(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Add Visit Types
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground">
              Available forms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visit Types</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Timepoints configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.validation_status === 'valid').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Forms completed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
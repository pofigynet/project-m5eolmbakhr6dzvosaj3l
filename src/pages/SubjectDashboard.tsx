import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Trash2,
  Settings,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Project, Form, Record } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { SafeDeleteDialog } from "@/components/SafeDeleteDialog";
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

export default function SubjectDashboard() {
  const { projectId, subjectId } = useParams<{ projectId: string; subjectId: string }>();
  const navigate = useNavigate();
  const { permissions, isAdmin } = useUserRole();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const { data: records = [], refetch: refetchRecords } = useQuery({
    queryKey: ['records', projectId, subjectId],
    queryFn: () => Record.filter({ project_id: projectId, record_id: subjectId }),
    enabled: !!projectId && !!subjectId,
  });

  // Use project visit types instead of local state
  const visitTypes = project?.visit_types || [];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'incomplete':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'unverified':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'not_started':
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const handleFormClick = (formId: string, visitId: string) => {
    const form = forms.find(f => f.id === formId);
    const visit = visitTypes.find(v => v.id === visitId);
    const status = getFormStatus(formId, visitId);
    
    if (form && visit) {
      if (status === 'not_started') {
        // Open empty form for data entry
        navigate(`/projects/${projectId}/data-entry?form=${formId}&subject=${subjectId}&visit=${visitId}`);
      } else {
        // Open filled form for review
        toast.info(`Opening ${form.form_name} for ${visit.name} (${getStatusLabel(status)})`);
        // TODO: Navigate to form review page
      }
    }
  };

  const handleDeleteSubject = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can delete subjects");
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all records for this subject
      const subjectRecords = records.filter(record => record.record_id === subjectId);
      for (const record of subjectRecords) {
        await Record.delete(record.id);
      }
      
      toast.success(`Subject ${subjectId} deleted successfully`);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast.error("Failed to delete subject");
      console.error("Error deleting subject:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          {permissions.canAccessSettings && (
            <TabsTrigger value="settings">Subject Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Subject Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Form Completion by Visit</CardTitle>
              <CardDescription>
                Track form completion across different visit timepoints. Click on forms to enter data or review existing entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forms.length > 0 && visitTypes.length > 0 ? (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center space-x-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Complete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Incomplete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Unverified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                      <span className="text-sm">Not Started</span>
                    </div>
                  </div>

                  {/* Visit Sections */}
                  <div className="space-y-6">
                    {visitTypes.map((visit) => (
                      <Card key={visit.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{visit.name}</CardTitle>
                          <CardDescription>
                            Visit {visit.order} - Forms available for this timepoint
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {forms.map((form) => {
                              const status = getFormStatus(form.id, visit.id);
                              return (
                                <div
                                  key={form.id}
                                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => handleFormClick(form.id, visit.id)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">{form.form_name}</h4>
                                    {getStatusIcon(status)}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {form.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      status === 'complete' ? 'bg-green-100 text-green-800' :
                                      status === 'incomplete' ? 'bg-red-100 text-red-800' :
                                      status === 'unverified' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {getStatusLabel(status)}
                                    </span>
                                    {status === 'not_started' ? (
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {forms.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No forms available for this visit
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>
                Available forms for this subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{form.form_name}</h4>
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Records
                      </Button>
                      {permissions.canEdit && (
                        <Button size="sm" asChild>
                          <Link to={`/projects/${projectId}/data-entry`}>
                            Enter Data
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {forms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>No forms available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit Schedule</CardTitle>
              <CardDescription>
                Configured visit types for this project (managed in project settings)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visitTypes.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{visit.order}.</span>
                      <span className="text-sm">{visit.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {records.filter(r => r.data?.visit_type === visit.id).length} records
                      </span>
                    </div>
                  </div>
                ))}
                {visitTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No visit types configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {permissions.canAccessSettings && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Subject Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage subject configuration and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Subject ID</Label>
                    <p className="text-sm text-muted-foreground">{subjectId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Records</Label>
                    <p className="text-sm text-muted-foreground">{records.length}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Valid Records</Label>
                    <p className="text-sm text-muted-foreground text-green-600">
                      {records.filter(r => r.validation_status === 'valid').length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Invalid Records</Label>
                    <p className="text-sm text-muted-foreground text-red-600">
                      {records.filter(r => r.validation_status === 'invalid').length}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Danger Zone</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this subject and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Subject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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

      {/* Safe Delete Dialog */}
      <SafeDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Subject"
        description={`This will permanently delete subject ${subjectId} and all associated data. This action cannot be undone.`}
        confirmationText={`DELETE ${subjectId}`}
        onConfirm={handleDeleteSubject}
        isLoading={isDeleting}
      />
    </div>
  );
}
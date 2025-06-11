import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Building,
  Shield,
  Plus,
  Trash2,
  Calendar,
  Edit
} from "lucide-react";
import { Project, Form, Record, User, FormVisitAssignment } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedVisit, setSelectedVisit] = useState<string>("");
  const [isEditingVisit, setIsEditingVisit] = useState(false);

  const { data: project, refetch: refetchProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => Project.get(id!),
    enabled: !!id,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms', id],
    queryFn: () => Form.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: records = [], refetch: refetchRecords } = useQuery({
    queryKey: ['records', id],
    queryFn: () => Record.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => User.list(),
  });

  const { data: formVisitAssignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ['formVisitAssignments', id],
    queryFn: () => FormVisitAssignment.filter({ project_id: id }),
    enabled: !!id,
  });

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

  // Get unique PIDs from records and sort them numerically
  const uniquePIDs = [...new Set(records.map(record => record.record_id))]
    .sort((a, b) => {
      // Extract numeric part for proper sorting (001, 002, etc.)
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

  // Create subjects dashboard data
  const subjectsData = uniquePIDs.map(pid => {
    const pidRecords = records.filter(record => record.record_id === pid);
    const formCompleteness = forms.map(form => {
      const formRecord = pidRecords.find(record => record.form_id === form.id);
      let status = 'not_started';
      
      if (formRecord) {
        if (formRecord.validation_status === 'valid') {
          status = 'complete';
        } else if (formRecord.validation_status === 'invalid') {
          status = 'incomplete';
        } else {
          status = 'unverified';
        }
      }
      
      return {
        formId: form.id,
        formName: form.form_name,
        status
      };
    });
    
    return {
      pid,
      forms: formCompleteness
    };
  });

  const getStatusColor2 = (status: string) => {
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

  const projectStats = {
    totalForms: forms.length,
    totalRecords: records.length,
    totalSubjects: uniquePIDs.length,
    validRecords: records.filter(r => r.validation_status === 'valid').length,
    invalidRecords: records.filter(r => r.validation_status === 'invalid').length,
  };

  const handleDeleteSubject = async (pid: string) => {
    try {
      // Delete all records for this subject
      const subjectRecords = records.filter(record => record.record_id === pid);
      for (const record of subjectRecords) {
        await Record.delete(record.id);
      }
      
      toast.success(`Subject ${pid} deleted successfully`);
      refetchRecords();
    } catch (error) {
      toast.error("Failed to delete subject");
      console.error("Error deleting subject:", error);
    }
  };

  const handleAssignFormToVisit = async (formId: string, visitId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        // Create assignment
        const form = forms.find(f => f.id === formId);
        const visit = project.visit_types?.find(v => v.id === visitId);
        
        await FormVisitAssignment.create({
          project_id: id!,
          form_id: formId,
          visit_type_id: visitId,
          visit_name: visit?.name || '',
          form_name: form?.form_name || '',
          is_required: true
        });
      } else {
        // Remove assignment
        const assignment = formVisitAssignments.find(
          a => a.form_id === formId && a.visit_type_id === visitId
        );
        if (assignment) {
          await FormVisitAssignment.delete(assignment.id);
        }
      }
      
      refetchAssignments();
      toast.success("Form assignment updated");
    } catch (error) {
      toast.error("Failed to update form assignment");
      console.error("Error updating form assignment:", error);
    }
  };

  const getFormsForVisit = (visitId: string) => {
    return formVisitAssignments
      .filter(assignment => assignment.visit_type_id === visitId)
      .map(assignment => forms.find(form => form.id === assignment.form_id))
      .filter(Boolean);
  };

  const isFormAssignedToVisit = (formId: string, visitId: string) => {
    return formVisitAssignments.some(
      assignment => assignment.form_id === formId && assignment.visit_type_id === visitId
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/projects/${id}/data-entry`}>
              <FileText className="mr-2 h-4 w-4" />
              Data Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.project_name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{project.principal_investigator}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{project.institution}</span>
          </div>
          {project.irb_number && (
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">IRB: {project.irb_number}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{project.number_of_visits || 1} visits</span>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              Data collection forms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Data entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projectStats.totalRecords > 0 ? Math.round((projectStats.validRecords / projectStats.totalRecords) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Valid records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subjects Dashboard</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="project-settings">Project Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects Dashboard</CardTitle>
              <CardDescription>
                Form completion status for each participant (PID). Subjects are automatically sorted by PID in ascending order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forms.length > 0 && uniquePIDs.length > 0 ? (
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
                  <div className="grid gap-2 p-4 bg-muted/30 rounded-lg font-medium" style={{gridTemplateColumns: `120px 60px repeat(${Math.min(forms.length, 8)}, 1fr)`}}>
                    <div>PID</div>
                    <div>Actions</div>
                    {forms.slice(0, 8).map((form) => (
                      <div key={form.id} className="text-center text-xs truncate" title={form.form_name}>
                        {form.form_name.substring(0, 10)}...
                      </div>
                    ))}
                  </div>

                  {/* Subject Rows */}
                  <div className="space-y-2">
                    {subjectsData.map((subject) => (
                      <div key={subject.pid} className="grid gap-2 p-4 border rounded-lg hover:bg-muted/20 transition-colors" style={{gridTemplateColumns: `120px 60px repeat(${Math.min(forms.length, 8)}, 1fr)`}}>
                        <div className="flex items-center">
                          <Link 
                            to={`/projects/${id}/subjects/${subject.pid}`}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                          >
                            {subject.pid}
                          </Link>
                        </div>
                        <div className="flex items-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subject {subject.pid}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all data for subject {subject.pid}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteSubject(subject.pid)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {subject.forms.slice(0, 8).map((form) => (
                          <div key={form.formId} className="flex justify-center">
                            <div 
                              className={`w-4 h-4 rounded-full ${getStatusColor2(form.status)} cursor-pointer hover:scale-110 transition-transform`}
                              title={`${form.formName}: ${getStatusLabel(form.status)}`}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No subjects or forms yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    Create forms and start entering data to see the subjects dashboard.
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <Button asChild>
                      <Link to={`/projects/${id}/forms/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Forms
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/projects/${id}/data-entry`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Enter Data
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... keep existing forms and data tabs */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Forms</CardTitle>
                  <CardDescription>
                    Data collection forms for this project
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link to={`/projects/${id}/forms/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Form
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{form.form_name}</h4>
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Order: {form.order_index}</span>
                        <span>Status: {form.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${id}/forms/${form.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
                {forms.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No forms yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Create your first data collection form to get started.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to={`/projects/${id}/forms/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Form
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Records</CardTitle>
              <CardDescription>
                Recent data entries for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Record {record.record_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Form: {forms.find(f => f.id === record.form_id)?.form_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Entered by: {users.find(u => u.id === record.entered_by)?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        record.validation_status === 'valid' ? 'default' :
                        record.validation_status === 'invalid' ? 'destructive' : 'secondary'
                      }>
                        {record.validation_status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No data yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Start collecting data by entering records through your forms.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to={`/projects/${id}/data-entry`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Enter Data
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Basic project details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Project Name</Label>
                    <p className="text-sm text-muted-foreground">{project.project_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="text-sm text-muted-foreground capitalize">{project.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Principal Investigator</Label>
                    <p className="text-sm text-muted-foreground">{project.principal_investigator}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Institution</Label>
                    <p className="text-sm text-muted-foreground">{project.institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">IRB Number</Label>
                    <p className="text-sm text-muted-foreground">{project.irb_number || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Number of Visits</Label>
                    <p className="text-sm text-muted-foreground">{project.number_of_visits || 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Types */}
            <Card>
              <CardHeader>
                <CardTitle>Visit Types</CardTitle>
                <CardDescription>
                  Configured visit schedule for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.visit_types?.map((visit, index) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-8">{visit.order}.</span>
                        <span className="text-sm">{visit.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVisit(visit.id)}
                      >
                        Configure
                      </Button>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No visit types configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form-Visit Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Form Assignments by Visit</CardTitle>
              <CardDescription>
                Configure which forms are available for each visit type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.visit_types && project.visit_types.length > 0 ? (
                <div className="space-y-6">
                  {project.visit_types.map((visit) => (
                    <div key={visit.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{visit.name}</h4>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Forms
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Forms to {visit.name}</DialogTitle>
                              <DialogDescription>
                                Select which forms should be available for this visit
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {forms.map((form) => (
                                <div key={form.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${visit.id}-${form.id}`}
                                    checked={isFormAssignedToVisit(form.id, visit.id)}
                                    onCheckedChange={(checked) => 
                                      handleAssignFormToVisit(form.id, visit.id, checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`${visit.id}-${form.id}`} className="text-sm">
                                    {form.form_name}
                                  </Label>
                                </div>
                              ))}
                              {forms.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  No forms available. Create forms first.
                                </p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="pl-4 space-y-2">
                        {getFormsForVisit(visit.id).map((form) => (
                          <div key={form?.id} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{form?.form_name}</span>
                          </div>
                        ))}
                        {getFormsForVisit(visit.id).length === 0 && (
                          <p className="text-sm text-muted-foreground pl-4">No forms assigned</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No visit types configured. Edit project settings to add visits.
                </p>
              )}
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Data validation and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data Validation</Label>
                  <p className="text-sm text-muted-foreground">
                    {project.settings?.data_validation ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    {project.settings?.audit_logging ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User Access Control</Label>
                  <p className="text-sm text-muted-foreground">
                    {project.settings?.user_access_control ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    {project.settings?.auto_backup ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
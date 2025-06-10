import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Building,
  Shield,
  Plus
} from "lucide-react";
import { Project, Form, Record, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => Project.get(id!),
    enabled: !!id,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms', id],
    queryFn: () => Form.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['records', id],
    queryFn: () => Record.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => User.list(),
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

  // Get unique PIDs from records
  const uniquePIDs = [...new Set(records.map(record => record.record_id))];

  // Create subjects dashboard data
  const subjectsData = uniquePIDs.map(pid => {
    const pidRecords = records.filter(record => record.record_id === pid);
    const formCompleteness = forms.map(form => {
      const formRecord = pidRecords.find(record => record.form_id === form.id);
      let status = 'not_started'; // gray
      
      if (formRecord) {
        if (formRecord.validation_status === 'valid') {
          status = 'complete'; // green
        } else if (formRecord.validation_status === 'invalid') {
          status = 'incomplete'; // red
        } else {
          status = 'unverified'; // yellow
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects Dashboard</CardTitle>
              <CardDescription>
                Form completion status for each participant (PID)
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
                  <div className="grid grid-cols-12 gap-2 p-4 bg-muted/30 rounded-lg font-medium">
                    <div className="col-span-2">PID</div>
                    <div className="col-span-10 grid grid-cols-10 gap-2">
                      {forms.slice(0, 10).map((form, index) => (
                        <div key={form.id} className="text-center text-xs truncate" title={form.form_name}>
                          {form.form_name.substring(0, 8)}...
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Rows */}
                  <div className="space-y-2">
                    {subjectsData.map((subject) => (
                      <div key={subject.pid} className="grid grid-cols-12 gap-2 p-4 border rounded-lg hover:bg-muted/20">
                        <div className="col-span-2 font-medium">{subject.pid}</div>
                        <div className="col-span-10 grid grid-cols-10 gap-2">
                          {subject.forms.slice(0, 10).map((form) => (
                            <div key={form.formId} className="flex justify-center">
                              <div 
                                className={`w-4 h-4 rounded-full ${getStatusColor2(form.status)} cursor-pointer`}
                                title={`${form.formName}: ${getStatusLabel(form.status)}`}
                              />
                            </div>
                          ))}
                        </div>
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
                      <Link to="/form-builder">
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
                  <Link to="/form-builder">
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
                        <Link to={`/form-builder?edit=${form.id}`}>
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
                      <Link to="/form-builder">
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Configure project options and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Data Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.settings?.data_validation ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.settings?.audit_logging ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">User Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.settings?.user_access_control ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Auto Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.settings?.auto_backup ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
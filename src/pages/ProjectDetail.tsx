import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Calendar,
  Building,
  Shield
} from "lucide-react";
import { Project, Form, Record, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const projectStats = {
    totalForms: forms.length,
    totalRecords: records.length,
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
          <Button asChild>
            <Link to={`/projects/${id}/forms/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Form
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
            <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{projectStats.validRecords}</div>
            <p className="text-xs text-muted-foreground">
              Passed validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Records</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{projectStats.invalidRecords}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
                    Add Form
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
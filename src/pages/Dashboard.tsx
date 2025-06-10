import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { 
  Plus, 
  FileText, 
  Users, 
  BarChart3,
  Database,
  Shield,
  Activity
} from "lucide-react";
import { Project, Form, Record, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
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

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
  });

  const stats = {
    totalProjects: projects.length,
    totalForms: forms.length,
    totalRecords: records.length,
    validRecords: records.filter(r => r.validation_status === 'valid').length,
  };

  const recentProjects = projects.slice(0, 5);
  const recentRecords = records.slice(0, 5);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {currentUser?.full_name || 'User'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/projects">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active research projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
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
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Data entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRecords > 0 ? Math.round((stats.validRecords / stats.totalRecords) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Valid records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your latest research projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {project.project_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.principal_investigator}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/projects/${project.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              {recentProjects.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                  <Button className="mt-2" size="sm" asChild>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Data Entries</CardTitle>
            <CardDescription>
              Latest data collection activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Record {record.record_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    record.validation_status === 'valid' ? 'bg-green-500' :
                    record.validation_status === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                </div>
              ))}
              {recentRecords.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No data entries yet</p>
                  <Button className="mt-2" size="sm" asChild>
                    <Link to="/form-builder">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Form
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/projects">
                <Database className="h-6 w-6 mb-2" />
                <span>Create Project</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/form-builder">
                <FileText className="h-6 w-6 mb-2" />
                <span>Build Form</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/quality-control">
                <Activity className="h-6 w-6 mb-2" />
                <span>Quality Control</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
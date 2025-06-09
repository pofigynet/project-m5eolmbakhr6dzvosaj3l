import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, FolderOpen, FileText, Users, AlertTriangle, CheckCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Project, Record, Form, User } from "@/entities";
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

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => User.list(),
  });

  const stats = [
    {
      title: "Active Projects",
      value: projects.filter(p => p.status !== 'completed').length,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Forms",
      value: forms.length,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Data Records",
      value: records.length,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Team Members",
      value: users.length,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentProjects = projects.slice(0, 5);
  const recentForms = forms.slice(0, 5);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {project.project_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.principal_investigator}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'production' ? 'bg-green-100 text-green-800' :
                        project.status === 'development' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FolderOpen className="mx-auto h-8 w-8 mb-2" />
                  <p>No projects yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/projects">Create your first project</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>
              Latest data collection forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentForms.length > 0 ? (
                recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {form.form_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {form.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        form.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/projects/${form.project_id}/forms/${form.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p>No forms yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/form-builder">Create your first form</Link>
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
                <FolderOpen className="h-6 w-6 mb-2" />
                Create New Project
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/form-builder/new">
                <FileText className="h-6 w-6 mb-2" />
                Build a Form
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/assistant">
                <MessageCircle className="h-6 w-6 mb-2" />
                Research Assistant
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Download } from "lucide-react";
import { Project, Record, Form } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function QualityControl() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['records'],
    queryFn: () => Record.list(),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms'],
    queryFn: () => Form.list(),
  });

  // Calculate quality metrics
  const qualityMetrics = {
    totalRecords: records.length,
    validRecords: records.filter(r => r.validation_status === 'valid').length,
    invalidRecords: records.filter(r => r.validation_status === 'invalid').length,
    pendingRecords: records.filter(r => r.validation_status === 'pending').length,
    completionRate: records.length > 0 ? (records.filter(r => r.validation_status === 'valid').length / records.length) * 100 : 0,
  };

  // Data quality by project
  const projectQuality = projects.map(project => {
    const projectRecords = records.filter(r => r.project_id === project.id);
    const validRecords = projectRecords.filter(r => r.validation_status === 'valid').length;
    return {
      name: project.project_name.substring(0, 15),
      total: projectRecords.length,
      valid: validRecords,
      invalid: projectRecords.filter(r => r.validation_status === 'invalid').length,
      completion: projectRecords.length > 0 ? (validRecords / projectRecords.length) * 100 : 0,
    };
  });

  // Common validation errors
  const validationErrors = records
    .filter(r => r.validation_errors && r.validation_errors.length > 0)
    .flatMap(r => r.validation_errors)
    .reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const errorData = Object.entries(validationErrors)
    .map(([error, count]) => ({ error: error.substring(0, 30), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent quality issues
  const recentIssues = records
    .filter(r => r.validation_status === 'invalid')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quality Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Data entries across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{qualityMetrics.validRecords}</div>
            <p className="text-xs text-muted-foreground">
              Passed all validation rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Records</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{qualityMetrics.invalidRecords}</div>
            <p className="text-xs text-muted-foreground">
              Failed validation checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall data quality score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">By Project</TabsTrigger>
          <TabsTrigger value="errors">Common Errors</TabsTrigger>
          <TabsTrigger value="issues">Recent Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality by Project</CardTitle>
                <CardDescription>
                  Validation status across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectQuality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valid" fill="#22c55e" name="Valid" />
                    <Bar dataKey="invalid" fill="#ef4444" name="Invalid" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Trend</CardTitle>
                <CardDescription>
                  Data quality over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projectQuality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completion" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Quality Summary</CardTitle>
              <CardDescription>
                Detailed quality metrics for each project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectQuality.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.total} total records
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {project.valid} valid
                        </div>
                        <div className="text-sm text-red-600">
                          {project.invalid} invalid
                        </div>
                      </div>
                      <Badge variant={project.completion >= 80 ? "default" : project.completion >= 60 ? "secondary" : "destructive"}>
                        {project.completion.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Validation Errors</CardTitle>
              <CardDescription>
                Frequently occurring data quality issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={errorData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="error" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quality Issues</CardTitle>
              <CardDescription>
                Latest validation failures requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.map((record) => (
                  <div key={record.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Record {record.record_id}</h4>
                        <Badge variant="destructive">Invalid</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Project: {projects.find(p => p.id === record.project_id)?.project_name}
                      </p>
                      <div className="text-sm text-red-600">
                        {record.validation_errors?.slice(0, 2).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                        {record.validation_errors && record.validation_errors.length > 2 && (
                          <div>• ... and {record.validation_errors.length - 2} more</div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Database, Users, Shield, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project, Record, User } from "@/entities";

export default function Dashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      try {
        return await Project.list();
      } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ['dashboard-records'],
    queryFn: async () => {
      try {
        return await Record.list();
      } catch (error) {
        console.error('Error fetching records:', error);
        return [];
      }
    },
  });

  const activeProjects = projects.filter(p => p.status === 'production' || p.status === 'development');
  const totalRecords = records.length;
  const recentRecords = records.slice(0, 5);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects.length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Records
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              System users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Security status
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently created research projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.principal_investigator || 'No PI assigned'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'production' ? 'bg-green-100 text-green-800' :
                      project.status === 'development' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest data entries and system activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Record {record.record_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
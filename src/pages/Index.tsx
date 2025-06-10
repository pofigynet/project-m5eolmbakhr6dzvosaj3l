import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { 
  Database, 
  FileText, 
  BarChart3, 
  Shield,
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: Database,
      title: "Project Management",
      description: "Organize research projects with comprehensive metadata and settings"
    },
    {
      icon: FileText,
      title: "Dynamic Forms",
      description: "Build custom data collection forms with validation and field types"
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Track data quality, completion rates, and project progress"
    },
    {
      icon: Shield,
      title: "Data Validation",
      description: "Ensure data integrity with built-in validation and quality control"
    },
    {
      icon: Users,
      title: "Subject Management",
      description: "Track participants across multiple visits and timepoints"
    }
  ];

  const benefits = [
    "Streamlined data collection workflows",
    "Real-time validation and quality control",
    "Comprehensive audit trails",
    "Flexible form builder",
    "Subject progress tracking",
    "Export capabilities for analysis"
  ];

  return (
    <div className="flex-1">
      <div className="flex items-center p-4 md:p-8 pt-6">
        <SidebarTrigger />
      </div>
      
      {/* Hero Section */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Research Data
              <span className="text-primary"> Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your research data collection with powerful forms, 
              validation, and subject tracking capabilities.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/projects">
                View Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 md:px-8 py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage research data efficiently and securely
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Why Choose Our Platform?</h2>
                <p className="text-muted-foreground">
                  Built specifically for research teams who need reliable, 
                  scalable data collection and management solutions.
                </p>
              </div>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button asChild>
                <Link to="/projects">
                  Start Your First Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Validation</span>
                    <span className="font-semibold">99.9% Accuracy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Form Types</span>
                    <span className="font-semibold">6+ Field Types</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Export Formats</span>
                    <span className="font-semibold">CSV, JSON</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Audit Trail</span>
                    <span className="font-semibold">Complete</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 md:px-8 py-12 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Join researchers worldwide who trust our platform for their data collection needs.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/form-builder">
                Build a Form
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
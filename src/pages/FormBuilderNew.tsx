import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { Form, Project } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function FormBuilderNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_id: "",
    form_name: "",
    description: "",
    is_active: true,
    order_index: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Project.list(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_id || !formData.form_name.trim()) {
      toast.error("Please select a project and enter a form name");
      return;
    }

    setIsLoading(true);
    try {
      const newForm = await Form.create({
        ...formData,
        schema: { fields: [] },
      });

      toast.success("Form created successfully!");
      navigate(`/projects/${formData.project_id}/forms/${newForm.id}/edit`);
    } catch (error) {
      toast.error("Failed to create form. Please try again.");
      console.error("Error creating form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/form-builder">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form Builder
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Form</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new data collection form for your research project
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>
              Basic information about your data collection form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form_name">Form Name *</Label>
                  <Input
                    id="form_name"
                    value={formData.form_name}
                    onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                    placeholder="Enter form name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">Display Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this form is used for"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Form is active</Label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/form-builder">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Creating..." : "Create & Edit Form"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
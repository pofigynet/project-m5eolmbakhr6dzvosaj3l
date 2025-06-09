import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Save, Plus, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Project, Form, Record, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DataEntry() {
  const { id: projectId } = useParams<{ id: string }>();
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [recordId, setRecordId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => Project.get(projectId!),
    enabled: !!projectId,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['forms', projectId],
    queryFn: () => Form.filter({ project_id: projectId, is_active: true }),
    enabled: !!projectId,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['records', projectId],
    queryFn: () => Record.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
  });

  const selectedFormData = forms.find(form => form.id === selectedForm);

  const validateField = (field: any, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'number' && value !== '' && value !== null) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `${field.label} must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `${field.label} must be at most ${field.validation.max}`;
      }
    }

    if (field.type === 'text' && value) {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        return `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        return `${field.label} must be at most ${field.validation.maxLength} characters`;
      }
      if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!selectedFormData?.schema?.fields) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    selectedFormData.schema.fields.forEach((field: any) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedForm || !recordId.trim()) {
      toast.error("Please select a form and enter a record ID");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const validationStatus = Object.keys(validationErrors).length === 0 ? 'valid' : 'invalid';
      const errorMessages = Object.values(validationErrors).filter(Boolean);

      await Record.create({
        project_id: projectId!,
        form_id: selectedForm,
        record_id: recordId,
        data: formData,
        validation_status: validationStatus,
        validation_errors: errorMessages,
        entered_by: currentUser?.id || '',
      });

      toast.success("Record saved successfully!");
      
      // Reset form
      setFormData({});
      setRecordId("");
      setValidationErrors({});
    } catch (error) {
      toast.error("Failed to save record. Please try again.");
      console.error("Error saving record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.name] || '';
    const error = validationErrors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.validation?.step || 'any'}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              className={error ? 'border border-red-500 rounded p-2' : ''}
            >
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.name}_${option}`} />
                  <Label htmlFor={`${field.name}_${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={`space-y-2 ${error ? 'border border-red-500 rounded p-2' : ''}`}>
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}_${option}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                  <Label htmlFor={`${field.name}_${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

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

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Entry</h1>
          <p className="text-muted-foreground mt-2">
            Project: {project?.project_name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Data Entry</TabsTrigger>
          <TabsTrigger value="records">Recent Records</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          {/* Form Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Form</CardTitle>
              <CardDescription>
                Choose which form you want to enter data for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-select">Form</Label>
                  <Select value={selectedForm} onValueChange={setSelectedForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.form_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="record-id">Record ID</Label>
                  <Input
                    id="record-id"
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    placeholder="Enter unique record ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Entry Form */}
          {selectedFormData && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedFormData.form_name}</CardTitle>
                <CardDescription>
                  {selectedFormData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedFormData.schema?.fields?.map((field: any) => renderField(field))}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {Object.keys(validationErrors).length === 0 ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Form is valid</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {Object.keys(validationErrors).length} validation error(s)
                        </span>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleSubmit} disabled={isLoading || !recordId.trim()}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {forms.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No forms available</h3>
                <p className="mt-2 text-muted-foreground">
                  Create forms in your project before entering data.
                </p>
                <Button className="mt-4" asChild>
                  <Link to={`/projects/${projectId}/forms/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Form
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>
                Latest data entries for this project
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
                        Entered: {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        record.validation_status === 'valid' ? 'bg-green-500' :
                        record.validation_status === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm capitalize">{record.validation_status}</span>
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>No records entered yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
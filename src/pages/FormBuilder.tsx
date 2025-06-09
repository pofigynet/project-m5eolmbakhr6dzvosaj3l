import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Eye, 
  Trash2,
  GripVertical,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Circle,
  List
} from "lucide-react";
import { Form, Project } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

const fieldTypes = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'radio', label: 'Radio Buttons', icon: Circle },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
];

export default function FormBuilder() {
  const { id: projectId, formId } = useParams<{ id: string; formId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!formId;

  const [formData, setFormData] = useState({
    form_name: "",
    description: "",
    is_active: true,
    order_index: 1,
  });

  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => Project.get(projectId!),
    enabled: !!projectId,
  });

  const { data: existingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => Form.get(formId!),
    enabled: !!formId && isEditing,
  });

  useEffect(() => {
    if (existingForm && isEditing) {
      setFormData({
        form_name: existingForm.form_name,
        description: existingForm.description,
        is_active: existingForm.is_active,
        order_index: existingForm.order_index,
      });
      
      if (existingForm.schema?.fields) {
        setFields(existingForm.schema.fields.map((field: any, index: number) => ({
          ...field,
          id: field.id || `field_${index}`,
        })));
      }
    }
  }, [existingForm, isEditing]);

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${fields.length + 1}`,
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: type === 'text' ? 'Enter text...' : undefined,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };
    
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!formData.form_name.trim()) {
      toast.error("Form name is required");
      return;
    }

    setIsLoading(true);
    try {
      const schema = {
        fields: fields.map(field => ({
          name: field.name,
          type: field.type,
          label: field.label,
          required: field.required,
          placeholder: field.placeholder,
          options: field.options,
          validation: field.validation,
        })),
      };

      const formPayload = {
        ...formData,
        project_id: projectId,
        schema,
      };

      if (isEditing) {
        await Form.update(formId!, formPayload);
        toast.success("Form updated successfully!");
      } else {
        await Form.create(formPayload);
        toast.success("Form created successfully!");
      }

      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast.error("Failed to save form. Please try again.");
      console.error("Error saving form:", error);
    } finally {
      setIsLoading(false);
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
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      {/* Form Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Form" : "Create New Form"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Project: {project?.project_name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>
              Basic information about your data collection form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form_name">Form Name *</Label>
                <Input
                  id="form_name"
                  value={formData.form_name}
                  onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                  placeholder="Enter form name"
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
          </CardContent>
        </Card>
      </div>

      {/* Form Builder */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Field Types */}
        <Card>
          <CardHeader>
            <CardTitle>Field Types</CardTitle>
            <CardDescription>
              Drag or click to add fields to your form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {fieldTypes.map((fieldType) => (
              <Button
                key={fieldType.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addField(fieldType.value)}
              >
                <fieldType.icon className="mr-2 h-4 w-4" />
                {fieldType.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <CardDescription>
              Preview how your form will look
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedField?.id === field.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedField(field)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{field.label}</span>
                    {field.required && <span className="text-red-500">*</span>}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveField(field.id, 'up');
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveField(field.id, 'down');
                      }}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Field Preview */}
                <div className="text-sm text-muted-foreground">
                  {field.type === 'text' && <Input placeholder={field.placeholder} disabled />}
                  {field.type === 'number' && <Input type="number" placeholder="Enter number" disabled />}
                  {field.type === 'date' && <Input type="date" disabled />}
                  {field.type === 'select' && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </Select>
                  )}
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="radio" disabled />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {field.type === 'checkbox' && (
                    <div className="space-y-2">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="checkbox" disabled />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Type className="mx-auto h-12 w-12 mb-4" />
                <p>No fields added yet</p>
                <p className="text-sm">Add fields from the left panel to build your form</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Field Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Field Properties</CardTitle>
            <CardDescription>
              {selectedField ? `Configure "${selectedField.label}"` : "Select a field to edit its properties"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedField ? (
              <>
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input
                    value={selectedField.name}
                    onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                    placeholder="field_name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    placeholder="Field label"
                  />
                </div>

                {selectedField.type === 'text' && (
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                    />
                  </div>
                )}

                {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                  <div className="space-y-2">
                    <Label>Options (one per line)</Label>
                    <Textarea
                      value={selectedField.options?.join('\n') || ''}
                      onChange={(e) => updateField(selectedField.id, { 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedField.required}
                    onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                  />
                  <Label>Required field</Label>
                </div>

                {selectedField.type === 'number' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={selectedField.validation?.min || ''}
                          onChange={(e) => updateField(selectedField.id, {
                            validation: { 
                              ...selectedField.validation, 
                              min: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={selectedField.validation?.max || ''}
                          onChange={(e) => updateField(selectedField.id, {
                            validation: { 
                              ...selectedField.validation, 
                              max: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedField.type === 'text' && (
                  <>
                    <div className="space-y-2">
                      <Label>Validation Pattern (Regex)</Label>
                      <Input
                        value={selectedField.validation?.pattern || ''}
                        onChange={(e) => updateField(selectedField.id, {
                          validation: { 
                            ...selectedField.validation, 
                            pattern: e.target.value 
                          }
                        })}
                        placeholder="^[A-Z]{2}[0-9]{4}$"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Min Length</Label>
                        <Input
                          type="number"
                          value={selectedField.validation?.minLength || ''}
                          onChange={(e) => updateField(selectedField.id, {
                            validation: { 
                              ...selectedField.validation, 
                              minLength: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Length</Label>
                        <Input
                          type="number"
                          value={selectedField.validation?.maxLength || ''}
                          onChange={(e) => updateField(selectedField.id, {
                            validation: { 
                              ...selectedField.validation, 
                              maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a field from the form preview to edit its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
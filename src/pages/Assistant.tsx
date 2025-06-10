import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageCircle, Send, Bot, User, Lightbulb, FileText, BarChart3, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { invokeLLM } from "@/integrations/core";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  {
    icon: FileText,
    title: "How do I create a new form?",
    description: "Learn about form building and field types",
  },
  {
    icon: BarChart3,
    title: "Understanding data validation",
    description: "Best practices for quality control",
  },
  {
    icon: Users,
    title: "Managing user permissions",
    description: "Role-based access control setup",
  },
  {
    icon: Lightbulb,
    title: "Export data formats",
    description: "Available export options and formats",
  },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your REDCap Lite research assistant. I can help you with data management, form creation, quality control, and best practices for clinical research. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await invokeLLM({
        prompt: `You are a helpful research assistant for a clinical data management platform called REDCap Lite. 
        The user is asking: "${messageText}"
        
        Provide helpful, accurate information about:
        - Clinical research data management
        - Form design and validation
        - Data quality control
        - User management and permissions
        - Export and analysis workflows
        - Best practices for research data
        
        Keep responses concise but informative. If the question is about specific technical features, provide step-by-step guidance.`,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to get response from assistant");
      console.error("Assistant error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Research Assistant</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Help</CardTitle>
              <CardDescription>
                Common questions and topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleQuickQuestion(question.title)}
                >
                  <div className="flex items-start space-x-3">
                    <question.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{question.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {question.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-start">
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Use specific field names in questions
                </Badge>
                <Badge variant="secondary" className="w-full justify-start">
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Ask about validation rules
                </Badge>
                <Badge variant="secondary" className="w-full justify-start">
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Request step-by-step guides
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Chat with Assistant</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-secondary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about research data management..."
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => handleSendMessage()} 
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
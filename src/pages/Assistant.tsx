import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageCircle, Send, Bot, User, Lightbulb, FileText, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { invokeLLM } from "@/integrations/core";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Research Assistant. I can help you with research data management, form design, statistical analysis, and methodology questions. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedQuestions = [
    {
      icon: FileText,
      title: "Form Design",
      question: "What are best practices for designing data collection forms in clinical research?"
    },
    {
      icon: BarChart3,
      title: "Data Analysis",
      question: "How should I structure my data for statistical analysis?"
    },
    {
      icon: Lightbulb,
      title: "Methodology",
      question: "What validation methods should I use for my research data?"
    }
  ];

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a comprehensive prompt for research assistance
      const prompt = `You are a research data management assistant. The user asked: "${text}"

Please provide helpful, accurate information about research data management, form design, data collection best practices, statistical analysis, or research methodology. 

Keep your response:
- Professional and academic in tone
- Practical and actionable
- Specific to research contexts
- Well-structured with clear points

If the question is about:
- Form design: Focus on best practices, field types, validation, user experience
- Data analysis: Discuss data structure, quality control, statistical considerations
- Methodology: Cover research design, data collection protocols, validation methods
- General research: Provide relevant guidance for academic/clinical research

Response:`;

      const response = await invokeLLM({
        prompt,
        add_context_from_internet: true,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: typeof response === 'string' ? response : 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting assistant response:', error);
      
      // Provide a helpful fallback response based on the question type
      let fallbackResponse = "I'm here to help with research data management questions. ";
      
      if (text.toLowerCase().includes('form')) {
        fallbackResponse += "For form design, consider using clear field labels, appropriate validation rules, logical field ordering, and user-friendly interfaces. Would you like specific guidance on any aspect of form creation?";
      } else if (text.toLowerCase().includes('data') || text.toLowerCase().includes('analysis')) {
        fallbackResponse += "For data management, focus on data quality, consistent formatting, proper validation, and secure storage. Consider using standardized data collection protocols and regular quality checks.";
      } else if (text.toLowerCase().includes('research') || text.toLowerCase().includes('study')) {
        fallbackResponse += "For research methodology, ensure your data collection methods align with your research objectives, use appropriate sample sizes, implement proper controls, and follow ethical guidelines.";
      } else {
        fallbackResponse += "I can help with form design, data collection strategies, quality control methods, and research best practices. What specific area would you like to explore?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      toast.error("Using offline mode - limited functionality available");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Research Assistant</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Chat Interface */}
        <div className="md:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>AI Research Assistant</span>
              </CardTitle>
              <CardDescription>
                Get help with research methodology, data management, and form design
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about research methodology, data management, or form design..."
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
              <CardDescription>
                Common research topics to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {predefinedQuestions.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-auto p-3 text-left justify-start"
                  onClick={() => handleSendMessage(item.question)}
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-3">
                    <item.icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.question.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assistant Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Research methodology guidance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Form design best practices</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Data quality strategies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Statistical analysis tips</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
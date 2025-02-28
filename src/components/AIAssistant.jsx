import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleTaskExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await simulateAIProcessing(userMessage);
    } catch (error) {
      console.error('Error processing request:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAIProcessing = async (userMessage) => {
    // First, add thinking message
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Thinking...', isThinking: true }
    ]);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove thinking message
    setMessages(prev => prev.filter(msg => !msg.isThinking));
    
    // For demonstration, we'll simulate the AI breaking down a task
    if (userMessage.toLowerCase().includes('create') || 
        userMessage.toLowerCase().includes('build') || 
        userMessage.toLowerCase().includes('implement')) {
      
      // Create a task breakdown
      const taskId = Date.now().toString();
      const newTask = {
        id: taskId,
        title: userMessage,
        steps: [
          { id: '1', title: 'Analyze requirements', status: 'completed' },
          { id: '2', title: 'Design solution architecture', status: 'in-progress' },
          { id: '3', title: 'Implement core functionality', status: 'pending' },
          { id: '4', title: 'Add error handling and edge cases', status: 'pending' },
          { id: '5', title: 'Test and refine', status: 'pending' }
        ],
        currentStep: 1
      };
      
      setCurrentTask(newTask);
      setExpandedTasks(prev => ({ ...prev, [taskId]: true }));
      
      // Add initial response
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `I'll help you with that! I've broken down this task into manageable steps:`,
          task: newTask
        }
      ]);
      
      // Simulate working through steps
      await simulateTaskProgress(newTask);
      
    } else {
      // For simple questions, just respond directly
      const responses = [
        "I can help with that! Here's a solution...",
        "Great question! Let me explain...",
        "I understand what you're looking for. Here's my suggestion..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: randomResponse }
      ]);
      
      // Add more detailed response after a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `To address your question about "${userMessage}", I would recommend the following approach...

This is where I would provide a detailed explanation or code snippet to help with your specific query.

\`\`\`javascript
// Example code that might be relevant
function handleUserRequest(request) {
  // Implementation details
  return processedResult;
}
\`\`\`

Would you like me to elaborate on any specific part of this solution?`
        }
      ]);
    }
  };

  const simulateTaskProgress = async (task) => {
    // Simulate progress through task steps
    for (let i = 1; i < task.steps.length; i++) {
      // Update current step
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedTask = {
        ...task,
        steps: task.steps.map((step, index) => ({
          ...step,
          status: index < i + 1 ? (index === i ? 'in-progress' : 'completed') : 'pending'
        })),
        currentStep: i
      };
      
      setCurrentTask(updatedTask);
      
      // Add step completion message
      if (i > 0) {
        const prevStep = task.steps[i - 1];
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: `✅ **Step ${i}:** ${prevStep.title} completed.

${getStepOutput(i, task.title)}`,
            task: updatedTask
          }
        ]);
      }
      
      // If this is the last step, mark task as complete
      if (i === task.steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const finalTask = {
          ...updatedTask,
          steps: updatedTask.steps.map(step => ({
            ...step,
            status: 'completed'
          })),
          completed: true
        };
        
        setCurrentTask(finalTask);
        
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: `✅ **Step ${i + 1}:** ${task.steps[i].title} completed.

Task complete! I've successfully addressed your request to "${task.title}".

Is there anything specific about the implementation you'd like me to explain or modify?`,
            task: finalTask
          }
        ]);
      }
    }
  };

  const getStepOutput = (stepIndex, taskTitle) => {
    // This would generate appropriate content based on the step and task
    const outputs = [
      `I've analyzed the requirements for "${taskTitle}". Here's what we need to implement...`,
      `Based on the requirements, I've designed a solution architecture with the following components...`,
      `Here's the core implementation:
      
\`\`\`javascript
// Core functionality implementation
function main() {
  // Initialize components
  const app = initializeApp();
  
  // Set up event handlers
  setupEventListeners(app);
  
  // Start application
  app.start();
}

function initializeApp() {
  // Implementation details
  return { /* app instance */ };
}
\`\`\`

This implements the basic functionality you requested. Let me know if you'd like any changes.`,
      `I've added error handling and addressed edge cases:

\`\`\`javascript
function processInput(input) {
  if (!input) {
    throw new Error('Input cannot be empty');
  }
  
  try {
    // Process the input
    return transformInput(input);
  } catch (error) {
    console.error('Error processing input:', error);
    return fallbackResult;
  }
}
\`\`\``,
      `I've tested the implementation and made some refinements:

1. Fixed edge case with empty inputs
2. Improved performance by optimizing the main loop
3. Added documentation for key functions

The implementation is now complete and ready to use.`
    ];
    
    return outputs[stepIndex - 1] || "Step completed successfully.";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block max-w-[85%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {message.isThinking ? (
                <div className="flex items-center">
                  <div className="mr-2">Thinking</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap markdown">
                  {message.content}
                </div>
              )}
              
              {message.task && (
                <div className="mt-3 border border-gray-600 rounded-md overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-2 bg-gray-800 cursor-pointer"
                    onClick={() => toggleTaskExpand(message.task.id)}
                  >
                    <div className="flex items-center">
                      <Sparkles size={16} className="mr-2 text-yellow-400" />
                      <span className="font-medium">Task Progress</span>
                    </div>
                    {expandedTasks[message.task.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                  
                  {expandedTasks[message.task.id] && (
                    <div className="p-2 bg-gray-800 border-t border-gray-700">
                      {message.task.steps.map((step, i) => (
                        <div key={step.id} className="flex items-center mb-1 last:mb-0">
                          <div className="mr-2 w-5 h-5 flex items-center justify-center">
                            {step.status === 'completed' ? (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            ) : step.status === 'in-progress' ? (
                              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-500"></div>
                            )}
                          </div>
                          <div className={`
                            ${step.status === 'completed' ? 'text-green-400' : 
                              step.status === 'in-progress' ? 'text-blue-400' : 'text-gray-500'}
                          `}>
                            {step.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-700 p-3">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about coding..."
            className="flex-1 bg-gray-700 text-gray-200 rounded-l-md px-3 py-2 focus:outline-none"
            disabled={isProcessing}
          />
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isProcessing}
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-1 px-1">
          AI assistant can help with coding tasks, debugging, and explaining concepts
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
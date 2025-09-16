'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, FileText } from 'lucide-react';

interface SetupGuideDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SetupGuideDialog({ children, open, onOpenChange }: SetupGuideDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use internal state if open/onOpenChange not provided
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  // Setup guide content - defined as constant to avoid re-creation
  const guideContent = `# NAS Device Setup Guide

## Overview
This guide will help you configure your Network Access Server (NAS) device to work with our AAA (Authentication, Authorization, and Accounting) server.

## Required Information
Before configuring your NAS device, you'll need the following information from your project's NAS-Configurations section:

- **AAA Server IP**: Primary AAA server IP address
- **AAA Secret**: Shared secret for RADIUS communication  
- **Auth Port**: Authentication port (typically 1812)
- **Acct Port**: Accounting port (typically 1813)
- **NAS-Identifier**: Unique identifier for your project

## Configuration Steps

### 1. Access Your NAS Device
- Log into your NAS device's administrative interface
- Navigate to the RADIUS or AAA configuration section

### 2. Configure RADIUS Server Settings
\`\`\`
Primary RADIUS Server: [AAA Server IP from your project]
Authentication Port: [Auth Port from your project]  
Accounting Port: [Acct Port from your project]
Shared Secret: [AAA Secret from your project]
\`\`\`

### 3. Set NAS-Identifier
Configure your NAS device to send the NAS-Identifier attribute:
\`\`\`
NAS-Identifier: [NAS-Identifier from your project]
\`\`\`

### 4. Enable RADIUS Authentication
- Enable RADIUS authentication for your desired services (WiFi, VPN, etc.)
- Disable local authentication fallback (recommended for security)

### 5. Test Configuration
- Attempt to authenticate a test user
- Check the authentication logs on both your NAS device and our dashboard
- Verify accounting records are being received

## Common Issues

### Authentication Failures
- Verify the shared secret matches exactly
- Check that the AAA server IP and ports are correct
- Ensure firewall rules allow traffic on RADIUS ports

### No Accounting Records  
- Verify accounting is enabled on your NAS device
- Check that the accounting port is configured correctly
- Ensure the NAS-Identifier is being sent

### Network Connectivity
- Test connectivity to the AAA server: \`telnet [AAA_SERVER_IP] 1812\`
- Verify DNS resolution if using hostnames
- Check for any intermediate firewalls blocking traffic

## Support
If you encounter issues during setup:
1. Check our dashboard logs for authentication attempts
2. Review your NAS device logs for error messages  
3. Contact our support team with the specific error details

## Security Best Practices
- Use strong, unique shared secrets
- Regularly rotate shared secrets
- Monitor authentication logs for suspicious activity
- Keep your NAS device firmware updated`;

  // Simple markdown-to-HTML converter for basic markdown
  const formatMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground border-b pb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-6 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-4 text-foreground">$1</h3>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border">$1</code>')
      .replace(/```([^```]+)```/g, '<pre class="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto mb-4 mt-2 border"><code class="text-foreground">$1</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|p])/gm, '<p class="mb-2">')
      .replace(/<p class="mb-2">(<[h|l])/g, '$1')
      .replace(/\n/g, '<br>');
  };

  const trigger = children || (
    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
      <HelpCircle className="h-4 w-4 mr-1" />
      Setup Guide
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            NAS Device Setup Guide
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="prose prose-sm max-w-none text-foreground space-y-4">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(guideContent) }} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

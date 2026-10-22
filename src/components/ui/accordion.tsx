import * as React from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Accordion=React.Root;
export const AccordionItem=React.Item;
export function AccordionTrigger({className,children,...props}:React.ComponentProps<typeof React.Trigger>){return <React.Header><React.Trigger className={cn('group flex w-full items-center justify-between py-4 text-left font-semibold text-white',className)} {...props}>{children}<ChevronDown size={16} className='transition-transform group-data-[state=open]:rotate-180'/></React.Trigger></React.Header>}
export function AccordionContent({className,children,...props}:React.ComponentProps<typeof React.Content>){return <React.Content className={cn('overflow-hidden text-sm text-white/60 data-[state=open]:animate-in',className)} {...props}><div className='pb-4'>{children}</div></React.Content>}

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import React from 'react'

interface TaskDetailsModalProps {
    task: {
        id: string;
        title: string;
        description: string;
        priority: string;
        status: string;
        deadline: string;
        created_at: string;
    };
    children: React.ReactNode;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, children }) => {
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow">
                    <div className="grid gap-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description:</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Priority:</h3>
                                <Badge className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Status:</h3>
                                <Badge variant="outline" className="text-sm font-medium">
                                    {task.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Deadline:</h3>
                                <p className="text-gray-700">{format(new Date(task.deadline), 'PPP p')}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Created:</h3>
                                <p className="text-gray-700">{format(new Date(task.created_at), 'PPP p')}</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default TaskDetailsModal
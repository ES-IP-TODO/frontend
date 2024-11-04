import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TaskUpdate } from "@/lib/types"
import { TaskService } from '@/services/Client/TaskService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from "date-fns"
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
    name: z.string().min(1, 'Task name is required'),
    description: z.string().min(1, 'Description is required'),
    deadline: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    }, {
        message: "Please select a valid date in the future or today",
    }),
    priority: z.enum(['low', 'medium', 'high'], {
        required_error: "Please select a priority level",
    }),
    status: z.enum(['todo', 'in-progress', 'done'], {
        required_error: "Please select a status",
    }),
})

type FormValues = z.infer<typeof formSchema>

interface EditTaskModalProps {
    task: TaskUpdate & { id: string };
    children: React.ReactNode;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, children }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: task.title || '',
            description: task.description || '',
            deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
        },
    })

    const updateTaskMutation = useMutation({
        mutationFn: (updatedTask: TaskUpdate) => TaskService.updateTask(task.id, updatedTask),
        onSuccess: () => {
            queryClient.invalidateQueries('tasks')
            setIsOpen(false)
        },
        onError: (error) => {
            console.error("Failed to update task:", error)
        },
    })

    const onSubmit = (data: FormValues) => {
        updateTaskMutation.mutate({
            title: data.name,
            description: data.description,
            deadline: new Date(data.deadline).toISOString(),
            priority: data.priority,
            status: data.status,
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deadline</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} min={format(new Date(), 'yyyy-MM-dd')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Update Task</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditTaskModal
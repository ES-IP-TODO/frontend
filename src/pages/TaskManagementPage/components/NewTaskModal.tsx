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
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from "date-fns"
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
    name: z.string().min(1, 'Task name is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    }, {
        message: "Please select a valid date in the future or today",
    }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    priority: z.enum(['low', 'medium', 'high'], {
        required_error: "Please select a priority level",
    }),
}).refine((data) => {
    const now = new Date();
    const selectedDate = new Date(`${data.date}T${data.time}`);
    if (data.date === format(now, 'yyyy-MM-dd')) {
        return selectedDate > now;
    }
    return true;
}, {
    message: "For today's date, time must be in the future",
    path: ["time"],
});

type FormValues = z.infer<typeof formSchema>

interface NewTaskModalProps {
    onAddTask: (task: {
        title: string;
        description: string;
        priority: string;
        deadline: string;
    }) => void;
    children: React.ReactNode;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onAddTask, children }) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '',
            priority: undefined,
        },
    })

    const onSubmit = (data: FormValues) => {
        const deadline = new Date(`${data.date}T${data.time}`).toISOString();
        onAddTask({
            title: data.name,
            description: data.description,
            priority: data.priority,
            deadline,
        })
        setIsOpen(false)
        form.reset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
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
                                        <Input placeholder="Enter task name" {...field} />
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
                                        <Textarea placeholder="Enter task description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex space-x-2">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Deadline Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} min={format(new Date(), 'yyyy-MM-dd')} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                className="w-[120px]"
                                                {...field}
                                                min={form.watch('date') === format(new Date(), 'yyyy-MM-dd')
                                                    ? format(new Date(), 'HH:mm')
                                                    : undefined}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a priority level" />
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
                        <Button type="submit" className="w-full">Add Task</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default NewTaskModal
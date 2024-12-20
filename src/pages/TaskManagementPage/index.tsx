import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskService } from '@/services/Client/TaskService';
import { UserService } from '@/services/Client/UserService';
import { useUserStore } from '@/stores/useUserStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowUpDown, Edit, Eye, GripVertical, LogOut, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import EditTaskModal from './components/EditTaskModal';
import NewTaskModal from './components/NewTaskModal';
import TaskDetailsModal from "./components/TaskDetailsModal";

const TaskManagement: React.FC = () => {
    const { token, givenName, familyName, setUserInformation, logout: zustandLogout } = useUserStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const [sortBy, setSortBy] = useState('creationTime');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState('all');

    const fetchTasks = async () => {
        const response = await TaskService.getTasks();
        return response.data;
    };

    const { data: tasks, refetch } = useQuery({
        queryKey: ["tasks"],
        queryFn: fetchTasks,
        enabled: !!token,
    });

    const fetchUser = async () => {
        const response = await UserService.getUser();
        return response.data;
    };

    const { data: userData } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        enabled: !!token,
    });

    useEffect(() => {
        if (userData && token) {
            setUserInformation(userData);
            setLoading(false);
        }
    }, [userData, setUserInformation, token]);

    const logout = async () => {
        const response = await UserService.logout();
        return response.data;
    };

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            zustandLogout();
            navigate('/');
        },
        onError: (error) => {
            console.error("Logout failed:", error);
        }
    });

    const handleLogout = async () => {
        logoutMutation.mutate();
    };

    const handleAddTask = async (task) => {
        try {
            const response = await TaskService.createTask(task);
            console.log("New task added:", response.data);
            refetch();
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    const handleDeleteTask = (id: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTaskMutation.mutate(id);
        }
    };

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            await TaskService.updateTask(id, { status: newStatus });
        },
        onMutate: async ({ id, newStatus }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries("tasks");

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData(["tasks"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["tasks"], old => {
                return old.map(task =>
                    task.id === id ? { ...task, status: newStatus } : task
                );
            });

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(["tasks"], context.previousTasks);
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries("tasks");
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            await TaskService.deleteTask(id);
        },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries("tasks");

            // Snapshot da lista atual de tarefas
            const previousTasks = queryClient.getQueryData(["tasks"]);

            // Remove a tarefa otimisticamente
            queryClient.setQueryData(["tasks"], (oldTasks: any) =>
                oldTasks.filter((task: any) => task.id !== id)
            );

            return { previousTasks };
        },
        onError: (error, id, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            console.error("Failed to delete task:", error);
        },
        onSettled: () => {
            queryClient.invalidateQueries("tasks");
        },
    });


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'todo':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">To Do</Badge>;
            case 'in-progress':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
            case 'done':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Done</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const sortTasks = (tasksToSort) => {
        let sortedTasks = [...tasksToSort];
        switch (sortBy) {
            case 'creationTime':
                sortedTasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'deadline':
                sortedTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                break;
            case 'completionStatus':
                const statusOrder = { 'todo': 0, 'in-progress': 1, 'done': 2 };
                sortedTasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
                break;
            default:
                break;
        }
        return sortOrder === 'desc' ? sortedTasks.reverse() : sortedTasks;
    };

    const filterTasks = (tasksToFilter) => {
        switch (filterBy) {
            case 'todo':
                return tasksToFilter.filter(task => task.status === 'todo');
            case 'inProgress':
                return tasksToFilter.filter(task => task.status === 'in-progress');
            case 'done':
                return tasksToFilter.filter(task => task.status === 'done');
            case 'highPriority':
                return tasksToFilter.filter(task => task.priority === 'high');
            case 'mediumPriority':
                return tasksToFilter.filter(task => task.priority === 'medium');
            case 'lowPriority':
                return tasksToFilter.filter(task => task.priority === 'low');
            default:
                return tasksToFilter;
        }
    };

    const sortedAndFilteredTasks = sortTasks(filterTasks(tasks || []));

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        const taskId = result.draggableId;
        const newStatus = destination.droppableId;

        if (source.droppableId !== newStatus) {
            updateTaskMutation.mutate({ id: taskId, newStatus });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-6">
            <div className="max-w-7.5xl mx-auto bg-white rounded-xl shadow-2xl p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {givenName} {familyName}</h1>
                    <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </header>

                <NewTaskModal onAddTask={handleAddTask}>
                    <Button className="flex items-center gap-2 mb-6">
                        <Plus className="w-4 h-4" /> New Task
                    </Button>
                </NewTaskModal>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {["todo", "in-progress", "done"].map((column) => (
                            <Droppable key={column} droppableId={column}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="bg-gray-100 p-4 rounded-lg min-h-[200px]"
                                    >
                                        <h2 className="text-xl font-semibold mb-4">
                                            {column === "todo" ? "To Do" : column === "in-progress" ? "In Progress" : "Done"}
                                        </h2>
                                        {(tasks || [])
                                            .filter(task => task.status === column)
                                            .map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <Card
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="mb-4"
                                                        >
                                                            <CardHeader>
                                                                <div className="flex justify-between items-center">
                                                                    <CardTitle className="text-lg">{task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}</CardTitle>
                                                                    <GripVertical className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {task.description.length > 30 ? `${task.description.slice(0, 30)}...` : task.description}
                                                                </p>
                                                                <div className="flex justify-between items-center text-sm mb-2">
                                                                    <span className={`px-3 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-200 text-red-800' :
                                                                        task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                                            'bg-green-200 text-green-800'
                                                                        }`}>
                                                                        {task.priority}
                                                                    </span>
                                                                    <span>Deadline: {format(new Date(task.deadline), 'PPP p')}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-500 mb-4">
                                                                    Created on: {format(new Date(task.created_at), 'PPP p')}
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <TaskDetailsModal task={task}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </Button>
                                                                    </TaskDetailsModal>
                                                                    <EditTaskModal task={task}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                    </EditTaskModal>
                                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                                                        <Trash className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                <div className="flex justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Select onValueChange={setSortBy} defaultValue={sortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="creationTime">Creation Time</SelectItem>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="completionStatus">Completion Status</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                    <Select onValueChange={setFilterBy} defaultValue={filterBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="inProgress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="highPriority">High Priority</SelectItem>
                            <SelectItem value="mediumPriority">Medium Priority</SelectItem>
                            <SelectItem value="lowPriority">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Creation Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAndFilteredTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}</TableCell>
                                    <TableCell>{task.description.length > 30 ? `${task.description.slice(0, 30)}...` : task.description}</TableCell>
                                    <TableCell>{task.priority}</TableCell>
                                    <TableCell>{format(new Date(task.deadline), 'PPP p')}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{format(new Date(task.created_at), 'PPP p')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <TaskDetailsModal task={task}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TaskDetailsModal>
                                            <EditTaskModal task={task}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </EditTaskModal>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default TaskManagement;
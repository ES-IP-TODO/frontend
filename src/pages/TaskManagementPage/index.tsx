import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskService } from '@/services/Client/TaskService';
import { UserService } from '@/services/Client/UserService';
import { useUserStore } from '@/stores/useUserStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { GripVertical, LogOut, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import NewTaskModal from './components/NewTaskModal';

const TaskManagement: React.FC = () => {
    const { token, givenName, familyName, setUserInformation, logout: zustandLogout } = useUserStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(tasks || []).map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}</TableCell>
                                    <TableCell>{task.description.length > 30 ? `${task.description.slice(0, 30)}...` : task.description}</TableCell>
                                    <TableCell>{task.priority}</TableCell>
                                    <TableCell>{format(new Date(task.deadline), 'PPP p')}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{format(new Date(task.created_at), 'PPP p')}</TableCell>
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
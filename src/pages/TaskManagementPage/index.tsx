import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskService } from '@/services/Client/TaskService';
import { UserService } from '@/services/Client/UserService';
import { useUserStore } from '@/stores/useUserStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Edit, Eye, GripVertical, LogOut, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import NewTaskModal from './components/NewTaskModal';

const TaskManagement: React.FC = () => {
    const { token, givenName, familyName, setUserInformation, logout: zustandLogout } = useUserStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Função para buscar as tarefas
    const fetchTasks = async () => {
        const response = await TaskService.getTasks();
        return response.data;
    };

    // Configuração da consulta de tarefas usando react-query
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

    // const [sortBy, setSortBy] = useState("");
    // const [filterBy, setFilterBy] = useState("");

    // Função para adicionar uma nova tarefa e atualizar o estado
    const handleAddTask = async (task) => {
        try {
            const response = await TaskService.createTask(task);
            console.log("New task added:", response.data);
            refetch(); // Refetch para atualizar a lista com a nova tarefa
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

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

    if (loading) {
        return <div>Loading...</div>; // Render a loading indicator while fetching user data
    }

    // // Filtragem e ordenação de tarefas
    // const sortedAndFilteredTasks = (tasks || [])
    //     .filter(task => filterBy === "" || task.priority === filterBy)
    //     .sort((a, b) => {
    //         if (sortBy === "name") return a.name.localeCompare(b.name);
    //         if (sortBy === "priority") return a.priority.localeCompare(b.priority);
    //         if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    //         if (sortBy === "createdAt") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    //         return 0;
    //     });

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

                {/* Renderização das tarefas utilizando Drag and Drop */}
                <DragDropContext onDragEnd={(result) => {/* Implementar lógica de drag and drop, se necessário */ }}>
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
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm">
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

                {/* Tabela de Tarefas */}
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
                            {(tasks || []).map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}</TableCell>
                                    <TableCell>{task.description.length > 30 ? `${task.description.slice(0, 30)}...` : task.description}</TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-200 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-green-200 text-green-800'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>{format(new Date(task.deadline), 'PPP p')}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{format(new Date(task.created_at), 'PPP p')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
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

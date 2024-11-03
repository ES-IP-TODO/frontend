import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserService } from '@/services/Client/UserService';
import { useUserStore } from '@/stores/useUserStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, GripVertical, LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const TaskManagement: React.FC = () => {
    const { token, givenName, familyName, setUserInformation, logout: zustandLogout } = useUserStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    console.log("Token accessed in TaskManagement:", token); // Check if the token is accessed

    const fetchUser = async () => {
        const response = await UserService.getUser();
        return response.data;
    };

    const { data } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        enabled: !!token,
    });

    useEffect(() => {
        console.log("User data:", data);
        if (data && token) {
            setUserInformation(data);
            setLoading(false);
        }
    }, [data, setUserInformation, token]);

    const logout = async () => {
        const response = await UserService.logout();
        return response.data;
    };

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            console.log(data);
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

    const [tasks, setTasks] = useState([
        { id: '1', name: "Create presentation", description: "Prepare slides for the meeting", priority: "high", deadline: "2024-03-15", status: "todo", createdAt: "2024-03-01" },
        { id: '2', name: "Review code", description: "Code review for PR #123", priority: "medium", deadline: "2024-03-10", status: "in-progress", createdAt: "2024-03-02" },
        { id: '3', name: "Update documentation", description: "Update project README", priority: "low", deadline: "2024-03-20", status: "done", createdAt: "2024-03-03" },
    ]);

    const [sortBy, setSortBy] = useState("");
    const [filterBy, setFilterBy] = useState("");
    const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

    const sortedAndFilteredTasks = tasks
        .filter(task => filterBy === "" || task.priority === filterBy)
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "priority") return a.priority.localeCompare(b.priority);
            if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            if (sortBy === "createdAt") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return 0;
        });

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const newTasks = Array.from(tasks);
        const [reorderedTask] = newTasks.splice(result.source.index, 1);
        reorderedTask.status = result.destination.droppableId;
        newTasks.splice(result.destination.index, 0, reorderedTask);

        setTasks(newTasks);
    };

    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
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

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {givenName} {familyName}</h1>
                    <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </header>

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
                                        {tasks
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
                                                                    <CardTitle className="text-lg">{task.name}</CardTitle>
                                                                    <GripVertical className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {expandedTasks.includes(task.id)
                                                                        ? task.description
                                                                        : `${task.description.slice(0, 50)}...`}
                                                                </p>
                                                                <div className="flex justify-between items-center text-sm mb-2">
                                                                    <span className={`px-3 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-200 text-red-800' :
                                                                        task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                                            'bg-green-200 text-green-800'
                                                                        }`}>
                                                                        {task.priority}
                                                                    </span>
                                                                    <span>Deadline: {task.deadline}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-500 mb-4">
                                                                    Created on: {task.createdAt}
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleTaskExpansion(task.id)}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        {expandedTasks.includes(task.id) ? 'Collapse' : 'Expand'}
                                                                    </Button>
                                                                    <Button variant="outline" size="sm">Edit</Button>
                                                                    <Button variant="destructive" size="sm">Delete</Button>
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

                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">All Tasks</h2>
                    </div>
                    <div className="flex gap-2">
                        <Select onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="createdAt">Creation Date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setFilterBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                                    <TableCell>{task.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <span className="mr-2">
                                                {expandedTasks.includes(task.id)
                                                    ? task.description
                                                    : `${task.description.slice(0, 30)}...`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-200 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-green-200 text-green-800'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>{task.deadline}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>{task.createdAt}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleTaskExpansion(task.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
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
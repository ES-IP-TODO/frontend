import { Loader2, LogIn } from "lucide-react";

// login/register imports
// import { UserService } from "@/services/Client/UserService";
// import { useUserStore } from "@/stores/useUserStore";
// import { useNavigate } from "react-router-dom";

export default function RedirectPage() {
    // const navigate = useNavigate();

    // // Function to extract the code from the URL
    // const getCodeFromUrl = () => {
    //     const params = new URLSearchParams(window.location.search);
    //     return params.get("code"); // Get the code from the URL
    // };

    // const login = async (code: string) => {
    //     const response = (await UserService.login(code)).data;
    //     return response;
    // };

    // const loginMutation = useMutation({
    //     mutationFn: login,
    //     onSuccess: (data) => {
    //         console.log(data.token);
    //         useUserStore.getState().login(data.token);
    //         navigate('/'); // Redirect after successful login
    //         // useUserStore.getState().setUserInformation(data.user);
    //     },
    //     onError: (error) => {
    //         console.error("Login failed:", error);
    //     }
    // });

    // useEffect(() => {
    //     const code = getCodeFromUrl(); // Extract the code from the URL

    //     if (code) {
    //         loginMutation.mutate(code.toString()); // Start the login process
    //     } else {
    //         console.error("No code found in the URL");
    //     }
    // }, []);

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                <div className="mb-6">
                    <LogIn className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
                </div>
                <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    Bem-vindo!
                </h2>
                <p className="text-gray-600 mb-6">
                    Estamos redirecionando você para a página inicial...
                    <br />
                    Por favor, aguarde.
                </p>
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
            </div>
        </div>
    );
}
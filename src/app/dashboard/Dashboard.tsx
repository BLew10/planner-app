import { auth } from "@/auth";

const Dashboard = async () => {
  const session = await auth();

  // Now you can access session.user or any other data that's included in the session object
  // Handle your session data here
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.email || "User"}</p> 
    </div>
  );
};

export default Dashboard;

import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";
import { Toaster} from "react-hot-toast";


export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        style: {
          background: "#FFFFFF",
          color: "#111111",
          fontFamily: "'JetBrains Mono', 'Space Grotesk'",
          border: "1px solid #E5E5E5",
          borderRadius: "0px",
        }
      }}/>
    </>
  )
}

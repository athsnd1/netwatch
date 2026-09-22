import { useNavigate } from "react-router-dom"

export default function Footer() {

    const navigate = useNavigate();

  return (
    <div className="mt-auto font-space text-textcol flex items-center justify-center text-sm mb-2.5">
        &copy; {new Date().getFullYear()} <span className="underline underline-offset-2 cursor-pointer font-semibold ml-1" onClick={() => {navigate("/")}}>NetWatch</span>. All Rights Reserved.
    </div>
  )
}

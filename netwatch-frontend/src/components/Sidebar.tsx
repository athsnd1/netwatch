import { NavLink } from "react-router-dom";
import { type IconType } from "react-icons";
import {
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineComputerDesktop,
  HiOutlinePlus,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";


type linkObj = {
  Icon: IconType;
  label: string;
  link: string;
}

export default function Sidebar() {

  const navLinks: linkObj[] = [
    {Icon: HiOutlineChartBar, label: "Dashboard", link: ""},
    {Icon: HiOutlineComputerDesktop, label: "Devices", link: "devices"},
    {Icon: HiOutlinePlus, label: "Add Device", link: "add"},
    {Icon: HiOutlineGlobeAlt, label: "Web Server", link: "webserver"},
    {Icon: HiOutlineClipboardDocumentList, label: "Logs", link: "logs"}
  ];

  return (
    <div className="w-full max-w-[160px] p-4 border-r border-bordercol hidden sm:flex flex-col items-start gap-3 fixed left-0 top-[60px] bottom-0 z-1000 bg-cards">

      {navLinks.map((navLink) => (
        <NavLink key={navLink.link} to={navLink.link} end={navLink.link === ""} className={({ isActive }) => `w-full flex items-center gap-1 font-space p-2 ${isActive ? "bg-textcol text-white" : "text-textcol"} hover:bg-hovercol hover:text-white transition-all`}>
          <navLink.Icon />{navLink.label}
        </NavLink>
      ))}

    </div>
  )
}

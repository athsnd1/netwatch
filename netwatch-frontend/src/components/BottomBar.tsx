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

export default function BottomBar() {

  const navLinks: linkObj[] = [
    {Icon: HiOutlineChartBar, label: "Home", link: ""},
    {Icon: HiOutlineComputerDesktop, label: "Devices", link: "devices"},
    {Icon: HiOutlinePlus, label: "Add", link: "add"},
    {Icon: HiOutlineGlobeAlt, label: "Web", link: "webserver"},
    {Icon: HiOutlineClipboardDocumentList, label: "Logs", link: "logs"}
  ];

  return (
    <div className="w-full border-t py-2 px-2 border-bordercol flex items-center justify-center gap-2 sticky bottom-0 z-1000 left-0 right-0 bg-cards sm:hidden">

      {navLinks.map((navLink) => (
        <NavLink key={navLink.link} to={navLink.link} end={navLink.link === ""} className={({ isActive }) => `w-max flex flex-col items-center gap-0.5 font-space py-1 px-2 text-sm ${isActive ? "bg-textcol text-white" : "text-textcol"} hover:bg-hovercol hover:text-white transition-all`}>
          <navLink.Icon />{navLink.label}
        </NavLink>
      ))}

    </div>
  )
}

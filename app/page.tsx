import Image from "next/image";
import Dashboard from "./dashboard/page";
export { default as Dashboard } from './dashboard/page';


export default function Home() {
  return (
    <div >
  <Dashboard />
    </div>
  );
}

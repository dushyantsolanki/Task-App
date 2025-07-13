import AxiousInstance from "@/helper/AxiousInstance";
import { useEffect } from "react";

export default function TaskStatusCard() {

  const getAllStatus = async () => {
    try {
      const response = await AxiousInstance.get('/task/status-lookup');
      console.log("Status fetched successfully:", await response.data);
    } catch (error) {
      console.error("Error fetching status:", error);

    }
  }


  useEffect(() => { getAllStatus() }, [])
  return (

    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <div className="aspect-video rounded-xl bg-muted/50" />
      <div className="aspect-video rounded-xl bg-muted/50" />
      <div className="aspect-video rounded-xl bg-muted/50" />
      <div className="aspect-video rounded-xl bg-muted/50" />
    </div>

  );
}
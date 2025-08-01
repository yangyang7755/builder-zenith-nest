import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

export default function BackendTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const testBackend = async () => {
      const result = await apiService.ping();
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage(result.data?.message || "Backend connected!");
      }
    };

    testBackend();
  }, []);

  if (status === "loading") {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">Testing backend connection...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">Backend Error: {message}</p>
        <p className="text-xs text-red-600 mt-1">
          Backend may not be deployed yet. That's totally fine - we can set it
          up!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-700">✅ Backend Connected: {message}</p>
    </div>
  );
}

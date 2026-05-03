"use client";

import { useEffect, useRef } from "react";
import { EDITHWebSocket } from "@/lib/websocket";

export function useWebSocket(
  sessionId: string,
  onMessage: (data: any) => void
) {
  const clientRef = useRef<EDITHWebSocket | null>(null);

  useEffect(() => {
    const client = new EDITHWebSocket(sessionId);
    client.connect(onMessage);
    clientRef.current = client;

    return () => client.disconnect();
  }, [sessionId, onMessage]);

  const send = (data: object) => {
    clientRef.current?.send(data);
  };

  return { send };
}

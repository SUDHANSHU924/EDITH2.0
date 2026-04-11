"use client";

import { useState } from "react";

export function useVoice() {
  const [active, setActive] = useState(false);

  const start = () => setActive(true);
  const stop = () => setActive(false);

  return { active, start, stop };
}

import { EditorContext } from "@/components/providers/editor-provider";
import { useContext } from "react";

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
}
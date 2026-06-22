"use client";

import { Handle, Position } from "@xyflow/react";

/**
 * Eight invisible anchor handles (a source + target on each side) so edges can
 * connect to whichever side routes most cleanly. Handles are hidden via CSS;
 * the user never draws connections — they're purely layout anchors.
 */
export function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="tt" />
      <Handle type="source" position={Position.Top} id="st" />
      <Handle type="target" position={Position.Bottom} id="tb" />
      <Handle type="source" position={Position.Bottom} id="sb" />
      <Handle type="target" position={Position.Left} id="tl" />
      <Handle type="source" position={Position.Left} id="sl" />
      <Handle type="target" position={Position.Right} id="tr" />
      <Handle type="source" position={Position.Right} id="sr" />
    </>
  );
}

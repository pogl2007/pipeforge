import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "reactflow";
import type { BlockDef, PipelineNodeData, PipelineStatus, RunResult } from "@/types";

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

const NODE_TYPE_BY_CATEGORY: Record<string, string> = {
  data: "dataNode",
  prep: "prepNode",
  model: "modelNode",
  eval: "evalNode",
};

interface PipelineState {
  pipelineId: string | null;
  pipelineName: string;
  status: PipelineStatus;
  result: RunResult | null;
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  resultsModalOpen: boolean;

  setPipelineId: (id: string | null) => void;
  setPipelineName: (name: string) => void;
  setStatus: (status: PipelineStatus) => void;
  setResult: (result: RunResult | null) => void;
  setResultsModalOpen: (open: boolean) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNodeFromBlock: (block: BlockDef, position: { x: number; y: number }) => void;
  updateNodeParams: (id: string, params: Record<string, unknown>) => void;
  updateNodeData: (id: string, data: Partial<PipelineNodeData>) => void;
  removeNode: (id: string) => void;
  setNodeRunStates: (states: Record<string, PipelineNodeData["runState"]>) => void;
  resetRunStates: () => void;
  clearGraph: () => void;
  loadGraph: (nodes: Node<PipelineNodeData>[], edges: Edge[]) => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  pipelineId: null,
  pipelineName: "Без названия",
  status: "DRAFT",
  result: null,
  nodes: [],
  edges: [],
  resultsModalOpen: false,

  setPipelineId: (id) => set({ pipelineId: id }),
  setPipelineName: (name) => set({ pipelineName: name }),
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result }),
  setResultsModalOpen: (open) => set({ resultsModalOpen: open }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, type: "deletable", animated: false },
        get().edges
      ),
    });
  },

  addNodeFromBlock: (block, position) => {
    const reactFlowType = NODE_TYPE_BY_CATEGORY[block.category];
    const newNode: Node<PipelineNodeData> = {
      id: nextId(block.type),
      type: reactFlowType as Node["type"],
      position,
      data: {
        category: block.category,
        nodeType: block.type,
        label: block.label,
        icon: block.icon,
        params: { ...(block.defaultParams ?? {}) },
        runState: "idle",
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeParams: (id, params) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, params: { ...n.data.params, ...params } } }
          : n
      ),
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  setNodeRunStates: (states) => {
    set({
      nodes: get().nodes.map((n) =>
        states[n.id] ? { ...n, data: { ...n.data, runState: states[n.id] } } : n
      ),
    });
  },

  resetRunStates: () => {
    set({
      nodes: get().nodes.map((n) => ({ ...n, data: { ...n.data, runState: "idle" } })),
    });
  },

  clearGraph: () => {
    set({ nodes: [], edges: [], status: "DRAFT", result: null });
  },

  loadGraph: (nodes, edges) => {
    set({ nodes, edges });
  },
}));

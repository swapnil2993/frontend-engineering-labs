import { useState } from "react";
import "./App.css";
import Checkbox from "./Checkbox";

type CheckboxState = "checked" | "unchecked" | "indeterminate";

export type CheckboxData = {
  id: string;
  label: string;
  state: CheckboxState;
  children?: CheckboxData[];
};

const checkboxes = [
  {
    id: "root",
    label: "All Categories",
    state: "indeterminate",
    children: [
      {
        id: "fruits",
        label: "Fruits",
        state: "indeterminate",
        children: [
          {
            id: "citrus",
            label: "Citrus",
            state: "checked",
            children: [
              { id: "orange", label: "Orange", state: "checked" },
              { id: "lemon", label: "Lemon", state: "checked" },
              { id: "lime", label: "Lime", state: "checked" },
            ],
          },
          {
            id: "berries",
            label: "Berries",
            state: "indeterminate",
            children: [
              { id: "strawberry", label: "Strawberry", state: "checked" },
              { id: "blueberry", label: "Blueberry", state: "unchecked" },
              { id: "raspberry", label: "Raspberry", state: "checked" },
            ],
          },
          {
            id: "tropical",
            label: "Tropical",
            state: "unchecked",
            children: [
              { id: "mango", label: "Mango", state: "unchecked" },
              { id: "pineapple", label: "Pineapple", state: "unchecked" },
              { id: "papaya", label: "Papaya", state: "unchecked" },
            ],
          },
        ],
      },
      {
        id: "vegetables",
        label: "Vegetables",
        state: "indeterminate",
        children: [
          {
            id: "leafy",
            label: "Leafy Greens",
            state: "checked",
            children: [
              { id: "spinach", label: "Spinach", state: "checked" },
              { id: "lettuce", label: "Lettuce", state: "checked" },
              { id: "kale", label: "Kale", state: "checked" },
            ],
          },
          {
            id: "rootVeg",
            label: "Root Vegetables",
            state: "indeterminate",
            children: [
              { id: "carrot", label: "Carrot", state: "checked" },
              { id: "beetroot", label: "Beetroot", state: "unchecked" },
              { id: "radish", label: "Radish", state: "checked" },
            ],
          },
          {
            id: "cruciferous",
            label: "Cruciferous",
            state: "unchecked",
            children: [
              { id: "broccoli", label: "Broccoli", state: "unchecked" },
              { id: "cauliflower", label: "Cauliflower", state: "unchecked" },
              { id: "cabbage", label: "Cabbage", state: "unchecked" },
            ],
          },
        ],
      },
      {
        id: "grains",
        label: "Grains",
        state: "indeterminate",
        children: [
          {
            id: "wholeGrains",
            label: "Whole Grains",
            state: "checked",
            children: [
              { id: "oats", label: "Oats", state: "checked" },
              { id: "brownRice", label: "Brown Rice", state: "checked" },
              { id: "quinoa", label: "Quinoa", state: "checked" },
            ],
          },
          {
            id: "refinedGrains",
            label: "Refined Grains",
            state: "unchecked",
            children: [
              { id: "whiteRice", label: "White Rice", state: "unchecked" },
              { id: "pasta", label: "Pasta", state: "unchecked" },
              { id: "whiteBread", label: "White Bread", state: "unchecked" },
            ],
          },
        ],
      },
    ],
  },
] as CheckboxData[];

/**
 * I treat the checkbox structure as a tree.
I first build two maps: one mapping node id to the node, and another mapping node id to its parent.
When a checkbox is toggled:

I update all its descendants to the same state.
Then I walk upward using the parent map and recompute each parent state based on its children.

This makes node lookup O(1) and the update complexity O(subtree + depth) instead of scanning the whole tree.
 */

function App() {
  const [checkboxState, setCheckboxState] =
    useState<CheckboxData[]>(checkboxes);

  const clonedState = [...checkboxState];

  function buildMaps(tree: CheckboxData[]) {
    const nodeMap = new Map<string, CheckboxData>();
    const parentMap = new Map<string, string | null>();

    function traverse(nodes: CheckboxData[], parentId: string | null) {
      for (const node of nodes) {
        nodeMap.set(node.id, node);
        parentMap.set(node.id, parentId);

        if (node.children) {
          traverse(node.children, node.id);
        }
      }
    }

    traverse(tree, null);

    return { nodeMap, parentMap };
  }

  const { nodeMap, parentMap } = buildMaps(clonedState);

  function updateChildren(node: CheckboxData, state: CheckboxState) {
    node.state = state;

    if (node.children) {
      for (const child of node.children) {
        updateChildren(child, state);
      }
    }
  }

  function updateParents(
    id: string,
    nodeMap: Map<string, CheckboxData>,
    parentMap: Map<string, string | null>,
  ) {
    let parentId = parentMap.get(id);

    while (parentId) {
      const parent = nodeMap.get(parentId)!;
      const children = parent.children!;

      const allChecked = children.every((c) => c.state === "checked");
      const allUnchecked = children.every((c) => c.state === "unchecked");

      if (allChecked) parent.state = "checked";
      else if (allUnchecked) parent.state = "unchecked";
      else parent.state = "indeterminate";

      parentId = parentMap.get(parentId) || null;
    }
  }

  function toggleCheckbox(
    id: string,
    checked: boolean,
    nodeMap: Map<string, CheckboxData>,
    parentMap: Map<string, string | null>,
  ) {
    const node = nodeMap.get(id)!;
    const newState = checked ? "checked" : "unchecked";

    updateChildren(node, newState);
    updateParents(id, nodeMap, parentMap);
  }

  const handleState = (id: string, checked: boolean) => {
    toggleCheckbox(id, checked, nodeMap, parentMap);
    setCheckboxState(clonedState);
  };

  return (
    <>
      {checkboxState.map((item) => (
        <Checkbox key={item.id} {...item} handleState={handleState} />
      ))}
    </>
  );
}

export default App;

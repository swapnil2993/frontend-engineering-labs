import { useEffect, useRef } from "react";
import type { CheckboxData } from "./App";

type CheckboxProps = CheckboxData & {
  handleState: (id: string, checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  children = [],
  state,
  handleState,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = state === "indeterminate";
    }
  }, [state]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleState(id, e.target.checked);
  };

  return (
    <div style={{ marginLeft: "12px", paddingLeft: "6px", textAlign: "left" }}>
      <label>
        <input
          ref={ref}
          type="checkbox"
          checked={state === "checked"}
          onChange={onChange}
        />
        {label}
      </label>

      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <Checkbox key={child.id} {...child} handleState={handleState} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Checkbox;
